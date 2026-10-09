# Kết nối trực tiếp Google Sheets (không dùng Apps Script)

Trang đọc sheet bằng đăng nhập Google (OAuth) + Sheets API. Sheet giữ riêng tư; chỉ tài khoản có quyền xem sheet mới tải được dữ liệu.

1. Vào https://console.cloud.google.com, chọn (hoặc tạo) project thuộc tổ chức kdi.edu.vn.
2. **APIs & Services → Library** → bật **Google Sheets API**.
3. **OAuth consent screen** → User type **Internal** (không cần xác minh ứng dụng) → thêm scope `.../auth/spreadsheets.readonly`.
4. **Credentials → Create credentials → OAuth client ID** → Application type **Web application**.
   - Authorized JavaScript origins: `https://luantrandata.github.io` (chỉ origin, không có đường dẫn).
5. Chép **Client ID** (dạng `xxxx.apps.googleusercontent.com`) dán vào `site/config.js`:
   `window.KPI_GOOGLE_CLIENT_ID = '...';`
6. Commit + push. Người dùng phải có quyền **xem** spreadsheet bằng tài khoản Google của họ.

Để trống `KPI_GOOGLE_CLIENT_ID` thì trang quay về chế độ Apps Script (hoặc snapshot mẫu).
