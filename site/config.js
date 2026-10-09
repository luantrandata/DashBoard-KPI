// ĐỌC TRỰC TIẾP GOOGLE SHEETS (không dùng Apps Script) bằng đăng nhập Google.
// 1) Dán OAuth Client ID (loại Web application) vào KPI_GOOGLE_CLIENT_ID. Client ID không phải bí mật.
// 2) Để trống KPI_GOOGLE_CLIENT_ID thì trang quay về chế độ Apps Script bên dưới (nếu có), hoặc snapshot mẫu.
window.KPI_GOOGLE_CLIENT_ID = '';
window.KPI_GOOGLE_DOMAIN = 'kdi.edu.vn';
window.KPI_SPREADSHEET_ID = '1eiulCUosKQsOqtiGjjRuRZfWXqO9QJ2XjW_UqcqgKWc';

// Chế độ cũ (Apps Script Web App) - chỉ dùng khi KPI_GOOGLE_CLIENT_ID để trống.
window.KPI_DATA_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwUFpj3s7UWpnywbFoSmhahbQSsOLQfxOCvurtk4tXzryK0cUkHRLwJzFyQUBNMrvYC/exec';
