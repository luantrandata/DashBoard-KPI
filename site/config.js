// ĐỌC TRỰC TIẾP GOOGLE SHEETS bằng đăng nhập Google (không dùng Apps Script).
// Dán OAuth Client ID (loại Web application) vào KPI_GOOGLE_CLIENT_ID. Client ID không phải bí mật.
// Hướng dẫn tạo: xem GOOGLE_OAUTH_SETUP.md. Để trống thì trang chỉ hiện snapshot mẫu.
window.KPI_GOOGLE_CLIENT_ID = '820045806158-j2rtt39ujbkj01pitdufmoutklq7f91j.apps.googleusercontent.com';
window.KPI_GOOGLE_DOMAIN = 'kdi.edu.vn';
window.KPI_SPREADSHEET_ID = '1eiulCUosKQsOqtiGjjRuRZfWXqO9QJ2XjW_UqcqgKWc';

// Liên kết sửa dữ liệu trong AppSheet (nút ✎ ở dòng chưa hoàn thành): base#control=<view>&row=<ID>
window.KPI_APPSHEET = {
  base: 'https://www.appsheet.com/start/c99e16a8-092b-4e24-9810-5aa219f1a138',
  views: { project: 'DuAn_Detail', task: 'CongViec_Detail', detail: 'LamViec_Detail' }
};
