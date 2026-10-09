/* Đọc trực tiếp Google Sheets bằng đăng nhập Google (OAuth) + Sheets API v4.
 * Không dùng Apps Script. Logic chuyển đổi dữ liệu là bản port của apps-script/Code.gs.
 * Cần window.KPI_GOOGLE_CLIENT_ID và window.KPI_SPREADSHEET_ID (xem config.js).
 * Access token chỉ giữ trong bộ nhớ trang, không lưu ra storage. */
(function () {
  'use strict';
  const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
  const GSI_SRC = 'https://accounts.google.com/gsi/client';
  let tokenClient = null, token = null, tokenExp = 0;

  const clean = v => (v === null || v === undefined) ? '' : String(v).trim();
  const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const pct = v => {
    let n = v;
    if (typeof v === 'string') { const t = v.trim().replace(',', '.'); n = parseFloat(t); if (t.endsWith('%') && Number.isFinite(n)) n = n / 100; }
    n = Number(n);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n <= 1 ? n * 100 : n));
  };
  const publicText = v => clean(v)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email đã ẩn]')
    .replace(/(?:\+?\d[\d .()\-]{7,}\d)/g, '[số đã ẩn]');
  const status = v => clean(v).replace(/^\s*\d+\.\s*/, '');
  const owner = v => clean(v) || 'Chưa phân công';
  const pad = n => String(n).padStart(2, '0');
  function date(v) {
    if (v === '' || v === null || v === undefined) return '';
    if (typeof v === 'number') {               // serial date của Google Sheets
      if (!Number.isFinite(v) || v <= 0) return '';
      return new Date(Math.round((Math.floor(v) - 25569) * 86400000)).toISOString().slice(0, 10);
    }
    const s = clean(v);
    let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) return m[3] + '-' + pad(m[2]) + '-' + pad(m[1]);
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[0];
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? '' : d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  // values: mảng 2 chiều (dòng 1 = header). Chỉ lấy các cột được yêu cầu.
  function rows(values, fields) {
    if (!values || values.length < 2) return [];
    const headers = values[0].map(h => clean(h));
    const idx = fields.map(f => headers.indexOf(f));
    return values.slice(1).map(r => fields.reduce((o, f, i) => { o[f] = idx[i] < 0 ? '' : (r[idx[i]] === undefined ? '' : r[idx[i]]); return o; }, {}));
  }

  function build(raw) {
    const departmentRows = rows(raw.KPIPhongBan, ['PhongBan', 'NamHoc', 'PhanTramDatKPI', 'TyTrongKPI', 'KetQua', 'SoNhanSu', 'SoDuAn']);
    const employeeRows = rows(raw.KPINhanVien, ['HoVaTen', 'PhongBan', 'NamHoc', 'PhanTramDatKPI', 'TyTrongKPI', 'KetQua']);
    const projectRows = rows(raw.DuAn, ['DuAnID', 'NamHoc', 'YeuCau', 'NhomCongViec', 'KPI', 'PhongBanPIC', 'PIC', 'PhanTram', 'NgayBatDau', 'NgayKetThuc', 'TrangThai']);
    const taskRows = rows(raw.CongViec, ['CongViecID', 'DuAnID', 'TenCongViecChiTiet', 'TenCongViec', 'NhomCongViec', 'PhongBanPIC', 'PIC', 'TienDoCVDone', 'NgayBatDau', 'NgayKetThuc', 'TrangThai']);
    const detailRows = rows(raw.LamViec, ['CongViecID', 'TenCongViecChiTiet', 'TenCongViec', 'NguoiThucHien', 'NgayBatDau', 'NgayKetThuc', 'TrangThai']);
    const projectById = {}, taskById = {};

    const departments = departmentRows.filter(r => clean(r.PhongBan) && clean(r.NamHoc)).map(r => ({
      name: clean(r.PhongBan), schoolYear: clean(r.NamHoc), achievement: pct(r.PhanTramDatKPI),
      weight: num(r.TyTrongKPI), result: clean(r.KetQua), employees: num(r.SoNhanSu), projects: num(r.SoDuAn)
    }));

    const people = employeeRows.filter(r => clean(r.HoVaTen) && clean(r.PhongBan) && clean(r.NamHoc)).map(r => ({
      name: clean(r.HoVaTen), department: clean(r.PhongBan), schoolYear: clean(r.NamHoc),
      achievement: pct(r.PhanTramDatKPI), weight: num(r.TyTrongKPI), result: clean(r.KetQua)
    }));

    const projects = [];
    projectRows.forEach((r, i) => {
      const name = publicText(r.NhomCongViec || r.YeuCau || ('Dự án ' + (i + 1)));
      const item = {
        key: 'project-' + (i + 1), name,
        group: publicText(r.NhomCongViec || r.YeuCau || name),
        kpi: publicText(r.KPI || r.YeuCau || r.NhomCongViec),
        hasKpi: !!clean(r.KPI), department: clean(r.PhongBanPIC), owner: owner(r.PIC),
        schoolYear: clean(r.NamHoc), progress: pct(r.PhanTram),
        start: date(r.NgayBatDau), due: date(r.NgayKetThuc), status: status(r.TrangThai)
      };
      const k = clean(r.DuAnID);
      if (k) projectById[k] = item;
      if (item.schoolYear && item.status) projects.push(item);
    });

    const tasks = taskRows.filter(r => clean(r.TrangThai)).map((r, i) => {
      const parent = projectById[clean(r.DuAnID)];
      if (!parent || !parent.schoolYear) return null;
      const item = {
        key: 'task-' + (i + 1), projectKey: parent.key,
        name: publicText(r.TenCongViec || r.TenCongViecChiTiet || ('Công việc ' + (i + 1))),
        project: parent.name, kpi: parent.kpi, hasKpi: parent.hasKpi,
        department: clean(r.PhongBanPIC) || parent.department || '', owner: owner(r.PIC),
        schoolYear: parent.schoolYear, progress: pct(r.TienDoCVDone),
        start: date(r.NgayBatDau), due: date(r.NgayKetThuc), status: status(r.TrangThai)
      };
      const k = clean(r.CongViecID);
      if (k) taskById[k] = item;
      return item;
    }).filter(Boolean);

    const details = detailRows.filter(r => clean(r.TrangThai)).map((r, i) => {
      const parent = taskById[clean(r.CongViecID)];
      if (!parent) return null;
      return {
        key: 'detail-' + (i + 1), taskKey: parent.key, projectKey: parent.projectKey, hasKpi: parent.hasKpi,
        name: publicText(r.TenCongViecChiTiet || r.TenCongViec || ('Công việc chi tiết ' + (i + 1))),
        department: parent.department, owner: owner(r.NguoiThucHien), schoolYear: parent.schoolYear,
        start: date(r.NgayBatDau), due: date(r.NgayKetThuc), status: status(r.TrangThai)
      };
    }).filter(Boolean);

    return {
      updatedAt: new Date().toISOString(), privacy: 'named', departments, people, projects, tasks, details,
      meta: { schemaVersion: 2, source: 'sheets-api', detailSourceRows: detailRows.length, detailLinked: details.length }
    };
  }

  function loadGsi() {
    if (window.google && google.accounts && google.accounts.oauth2) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = GSI_SRC; s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('GSI_BLOCKED'));
      document.head.appendChild(s);
    });
  }

  // interactive=false: thử lấy token im lặng (không popup); thất bại → reject NEED_LOGIN
  function getToken(interactive) {
    if (token && Date.now() < tokenExp - 60000) return Promise.resolve(token);
    return loadGsi().then(() => new Promise((resolve, reject) => {
      if (!tokenClient) {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: window.KPI_GOOGLE_CLIENT_ID, scope: SCOPE, hd: window.KPI_GOOGLE_DOMAIN || undefined,
          callback: () => {}, error_callback: () => {}
        });
      }
      tokenClient.callback = resp => {
        if (resp && resp.access_token) { token = resp.access_token; tokenExp = Date.now() + (Number(resp.expires_in) || 3600) * 1000; resolve(token); }
        else reject(new Error(resp && resp.error === 'access_denied' ? 'ACCESS_DENIED' : 'NEED_LOGIN'));
      };
      tokenClient.error_callback = () => reject(new Error('NEED_LOGIN'));
      tokenClient.requestAccessToken({ prompt: interactive ? '' : 'none' });
    }));
  }

  async function fetchTab(id, name, accessToken) {
    const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + encodeURIComponent(id) + '/values/' + encodeURIComponent(name) +
      '?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER&majorDimension=ROWS';
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + accessToken } });
    if (res.ok) return (await res.json()).values || [];
    let msg = ''; try { msg = (await res.json()).error.message || ''; } catch (e) {}
    if (res.status === 400 && /Unable to parse range/i.test(msg)) return [];      // thiếu tab → coi như rỗng (giống Code.gs)
    const err = new Error(msg || ('HTTP ' + res.status)); err.status = res.status; throw err;
  }

  async function load(interactive) {
    const id = String(window.KPI_SPREADSHEET_ID || '').trim();
    const accessToken = await getToken(interactive);
    const names = ['KPIPhongBan', 'KPINhanVien', 'DuAn', 'CongViec', 'LamViec'];
    try {
      const out = await Promise.all(names.map(n => fetchTab(id, n, accessToken)));
      const raw = {}; names.forEach((n, i) => { raw[n] = out[i]; });
      return build(raw);
    } catch (e) {
      if (e.status === 401) { token = null; tokenExp = 0; }
      throw e;
    }
  }

  window.KPI_DIRECT = { load, build, signOut() { if (token && window.google && google.accounts) google.accounts.oauth2.revoke(token, () => {}); token = null; tokenExp = 0; } };
})();
