/**
 * Public, read-only sample-data endpoint for the KPI preview.
 * Deploy as a web app that executes as the spreadsheet owner.
 * Only selected fields are returned; contact fields, edit history, logs,
 * employee codes and source names are never included in the response.
 */
const SOURCE_SPREADSHEET_ID = '1eiulCUosKQsOqtiGjjRuRZfWXqO9QJ2XjW_UqcqgKWc';

function doGet(e) {
  const callback = String((e && e.parameter && e.parameter.callback) || '');
  if (callback !== 'window.__kpiSheetCallback') {
    return ContentService.createTextOutput('Invalid callback').setMimeType(ContentService.MimeType.TEXT);
  }

  const payload = buildPublicSample_();
  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function buildPublicSample_() {
  const book = SpreadsheetApp.openById(SOURCE_SPREADSHEET_ID);
  const departmentRows = readRows_(book, 'KPIPhongBan', ['PhongBan', 'NamHoc', 'PhanTramDatKPI', 'TyTrongKPI', 'KetQua', 'SoNhanSu', 'SoDuAn']);
  const employeeRows = readRows_(book, 'KPINhanVien', ['HoVaTen', 'PhongBan', 'NamHoc', 'PhanTramDatKPI', 'TyTrongKPI', 'KetQua']);
  const projectRows = readRows_(book, 'DuAn', ['DuAnID', 'NamHoc', 'YeuCau', 'NhomCongViec', 'KPI', 'PhongBanPIC', 'PIC', 'PhanTram', 'NgayBatDau', 'NgayKetThuc', 'TrangThai']);
  const taskRows = readRows_(book, 'CongViec', ['DuAnID', 'TenCongViecChiTiet', 'TenCongViec', 'NhomCongViec', 'PhongBanPIC', 'PIC', 'TienDoCVDone', 'NgayBatDau', 'NgayKetThuc', 'TrangThai']);

  const peopleNames = [];
  employeeRows.forEach(r => peopleNames.push(r.HoVaTen));
  projectRows.forEach(r => peopleNames.push(r.PIC));
  taskRows.forEach(r => peopleNames.push(r.PIC));
  const aliases = makeAliases_(peopleNames);
  const projectById = {};

  const departments = departmentRows
    .filter(r => clean_(r.PhongBan) && clean_(r.NamHoc))
    .map(r => ({
      name: clean_(r.PhongBan),
      schoolYear: clean_(r.NamHoc),
      achievement: percent_(r.PhanTramDatKPI),
      weight: number_(r.TyTrongKPI),
      result: clean_(r.KetQua),
      employees: number_(r.SoNhanSu),
      projects: number_(r.SoDuAn)
    }));

  const people = employeeRows
    .filter(r => clean_(r.HoVaTen) && clean_(r.PhongBan) && clean_(r.NamHoc))
    .map(r => ({
      name: alias_(r.HoVaTen, aliases),
      department: clean_(r.PhongBan),
      schoolYear: clean_(r.NamHoc),
      achievement: percent_(r.PhanTramDatKPI),
      weight: number_(r.TyTrongKPI),
      result: clean_(r.KetQua)
    }));

  const projects = [];
  projectRows.forEach((r, index) => {
      const name = publicText_(r.YeuCau || r.NhomCongViec || ('Dự án ' + (index + 1)));
      const item = {
        key: 'project-' + (index + 1),
        name,
        kpi: publicText_(r.KPI || r.YeuCau || r.NhomCongViec),
        department: clean_(r.PhongBanPIC),
        owner: alias_(r.PIC, aliases),
        schoolYear: clean_(r.NamHoc),
        progress: percent_(r.PhanTram),
        start: date_(r.NgayBatDau),
        due: date_(r.NgayKetThuc),
        status: status_(r.TrangThai)
      };
      const sourceKey = clean_(r.DuAnID);
      if (sourceKey) projectById[sourceKey] = item;
      if (item.schoolYear && item.status) projects.push(item);
    });

  const tasks = taskRows
    .filter(r => clean_(r.TrangThai))
    .map((r, index) => {
      const parent = projectById[clean_(r.DuAnID)];
      if (!parent || !parent.schoolYear) return null;
      return {
        key: 'task-' + (index + 1),
        name: publicText_(r.TenCongViecChiTiet || r.TenCongViec || ('Công việc ' + (index + 1))),
        project: parent ? parent.name : publicText_(r.NhomCongViec),
        kpi: parent ? parent.kpi : publicText_(r.NhomCongViec),
        department: clean_(r.PhongBanPIC) || (parent && parent.department) || '',
        owner: alias_(r.PIC, aliases),
        schoolYear: parent.schoolYear,
        progress: percent_(r.TienDoCVDone),
        start: date_(r.NgayBatDau),
        due: date_(r.NgayKetThuc),
        status: status_(r.TrangThai)
      };
    }).filter(Boolean);

  return {
    updatedAt: new Date().toISOString(),
    privacy: 'anonymized-sample',
    departments,
    people,
    projects,
    tasks
  };
}

function readRows_(book, name, requestedFields) {
  const sheet = book.getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const lastColumn = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0].map(v => String(v).trim());
  const rowCount = sheet.getLastRow() - 1;
  const columns = {};
  requestedFields.forEach(field => {
    const index = headers.indexOf(field);
    columns[field] = index < 0 ? Array(rowCount).fill('') : sheet.getRange(2, index + 1, rowCount, 1).getValues().map(row => row[0]);
  });
  return Array.from({length: rowCount}, (_, rowIndex) => requestedFields.reduce((out, field) => {
    out[field] = columns[field][rowIndex];
    return out;
  }, {}));
}

function makeAliases_(values) {
  const names = [...new Set(values.map(clean_).filter(Boolean))].sort();
  const properties = PropertiesService.getScriptProperties();
  const existing = properties.getProperties();
  const pending = {};
  const out = {};
  names.forEach(name => {
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, name.toLowerCase(), Utilities.Charset.UTF_8);
    const storageKey = 'alias:' + digest.slice(0, 12).map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join('');
    const alias = existing[storageKey] || ('Nhân viên ' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase());
    out[name.toLowerCase()] = alias;
    if (!existing[storageKey]) pending[storageKey] = alias;
  });
  if (Object.keys(pending).length) properties.setProperties(pending, false);
  return out;
}

function alias_(value, aliases) {
  const name = clean_(value);
  return name ? (aliases[name.toLowerCase()] || 'Người phụ trách') : 'Chưa phân công';
}

function clean_(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function publicText_(value) {
  return clean_(value)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email đã ẩn]')
    .replace(/(?:\+?\d[\d .()\-]{7,}\d)/g, '[số đã ẩn]');
}

function number_(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function percent_(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n <= 1 ? n * 100 : n));
}

function status_(value) {
  return clean_(value).replace(/^\s*\d+\.\s*/, '');
}

function date_(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? '' : Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
