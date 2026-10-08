# Dashboard KPI & Công việc

Dashboard quản trị **KPI phòng ban / nhân viên, dự án và công việc** cho STEM TOWN.
Trang web tĩnh (HTML/CSS/JS thuần, không build step) chạy trên **GitHub Pages**, lấy dữ liệu từ **Google Sheets** qua **Google Apps Script**, và đã **ẩn danh** để có thể công khai.

- Trang demo: https://luantrandata.github.io/DashBoard-KPI/
- Ngôn ngữ giao diện: tiếng Việt

---

## 1. Kiến trúc & luồng dữ liệu

```
Google Sheets ──► Apps Script (Code.gs) ──JSONP──► site/index.html
 (nguồn)          đọc + ẩn danh + allowlist          render dashboard
                                                       ▲
                                  site/data-snapshot.js (dữ liệu dự phòng)
```

1. Trang tải `data-snapshot.js` và hiển thị ngay (không cần mạng).
2. Sau đó gọi Apps Script bằng **JSONP** (timeout 15 giây). Thành công thì thay dữ liệu và vẽ lại; lỗi thì giữ nguyên snapshot.
3. Nút **Làm mới dữ liệu** gọi lại endpoint.
4. Dữ liệu live chỉ được nhận khi có cờ `privacy === 'anonymized-sample'`.

## 2. Cấu trúc thư mục

| Đường dẫn | Vai trò |
|---|---|
| `site/index.html` | Toàn bộ giao diện, CSS và JS (vanilla, không phụ thuộc thư viện ngoài) |
| `site/data-snapshot.js` | `window.KPI_SNAPSHOT`: dữ liệu dự phòng đã ẩn danh |
| `site/config.js` | `window.KPI_DATA_ENDPOINT`: URL Web App của Apps Script |
| `apps-script/Code.gs` | Endpoint chỉ đọc, đọc các sheet nguồn, ẩn danh và trả JSON |
| `scripts/build-public-sample.py` | Tạo `data-snapshot.js` từ file Excel trên máy (pandas) |
| `.github/workflows/deploy-pages.yml` | Tự deploy thư mục `site/` khi push lên `main` |
| `.github/workflows/static.yml` | Workflow Pages thủ công (bản dự phòng) |
| `CHANGELOG.md` | Lịch sử phiên bản và cách quay lại |

## 3. Nguồn dữ liệu (Google Sheets)

`Code.gs` đọc các sheet sau (chỉ các cột nằm trong allowlist):

| Sheet | Cấp / vai trò | Trường dùng chính |
|---|---|---|
| `KPIPhongBan` | KPI theo phòng ban | kết quả, % đạt, trọng số, số dự án, số nhân viên |
| `KPINhanVien` | KPI theo nhân viên | `PhanTramDatKPI`, `KetQua` |
| `DuAn` | **Cấp 1 – Dự án** (tên = `NhomCongViec`) | ngày bắt đầu/kết thúc, `PhanTram`, trạng thái, PIC |
| `CongViec` | **Cấp 2 – Công việc** (tên = `TenCongViec`) | `CongViecID`, `DuAnID`, `TienDoCVDone`, ngày, trạng thái, PIC |
| `LamViec` | **Cấp 3 – Công việc chi tiết** (tên = `TenCongViecChiTiet`) | `CongViecID`, `NguoiThucHien`, ngày, trạng thái |

Quan hệ: `DuAn` → `CongViec` (qua `DuAnID`) → `LamViec` (qua `CongViecID`).

## 4. Các tab

| Tab | Nội dung chính |
|---|---|
| **Tổng quan KPI** | Thẻ số liệu, Dự án theo KPI, KPI theo trạng thái, KPI theo phòng ban, Trạng thái dự án, bảng Dự án theo KPI phòng ban, bảng KPI nhân viên |
| **Dự án** | Thẻ số liệu, dự án kết thúc theo tháng, dự án theo trạng thái, **Dự án theo phòng ban**, số dự án theo nhân sự, **Tiến độ thực tế so với kế hoạch**, timeline dự án, bảng tiến độ |
| **Công việc** | Thẻ số liệu, công việc kết thúc theo tháng, theo trạng thái, **Khối lượng công việc đang mở theo nhân sự**, **Thời gian trễ hạn**, **Số công việc theo dự án** (Chưa thực hiện / Đang thực hiện / Quá hạn), timeline công việc, bảng theo dõi |
| **Timeline** | Cây **Dự án → Công việc → Công việc chi tiết** kiểu Jira: mở/đóng từng cấp, thu phóng Tuần/Tháng/Quý, vạch "Hôm nay", cột **Tiến độ** và **Trạng thái**, cảnh báo quá hạn, **lọc nhanh** (Công việc tuần này / tháng này, Hết hạn tuần này / tháng này) |
| **Cảnh báo** | Công việc quá hạn hoặc sắp đến hạn và KPI theo trạng thái nguồn |

**Bộ lọc chung:** Từ ngày, Đến ngày, Năm học, Chọn nhanh theo tháng (T7 … T6), Phòng ban, Nhân viên, Trạng thái / Kết quả KPI, Tìm kiếm, nút **Đặt lại tất cả**.
**Tương tác:** nhiều biểu đồ cho phép bấm để lọc chéo (cross-filter); các bảng/panel có nút **Mở rộng** và xuất CSV.

## 5. Quy tắc nghiệp vụ

- **KPI không được tính lại trên web.** Phần trăm và kết quả lấy từ cột nguồn (`PhanTramDatKPI`, `KetQua`); chỉ điểm tổng hợp theo phòng ban dùng trung bình có trọng số.
- **Tiến độ:** dự án lấy từ `PhanTram`; công việc lấy từ `TienDoCVDone`; công việc chi tiết không có tiến độ nên chỉ tô theo trạng thái (hoàn thành = 100%).
- **Bốn trạng thái hiển thị thống nhất** (màu dùng chung ở mọi biểu đồ): Chưa thực hiện (xám), Đang thực hiện (xanh dương), Hoàn thành (xanh lá), Quá hạn / sắp đến hạn (đỏ).
- **Quá hạn:** chưa hoàn thành/chưa hủy và hạn kết thúc đã qua. **Sắp đến hạn:** còn tối đa 7 ngày.
- Trạng thái `Pending` được gộp vào "Chưa thực hiện".
- **Chậm tiến độ (tab Dự án):** thực tế thấp hơn kế hoạch hơn `LAG_THRESHOLD` = 20 điểm %, trong đó kế hoạch = % thời gian đã trôi giữa ngày bắt đầu và kết thúc.
- **Lọc nhanh Timeline:** "tuần này" tính thứ 2 – chủ nhật; "Hết hạn" chỉ tính công việc chưa hoàn thành có hạn trong tuần/tháng hiện tại.
- Phòng ban chưa triển khai KPI (trọng số = 0 và không có dự án) được ẩn khỏi biểu đồ KPI theo phòng ban và ghi chú bên dưới.

## 6. Bảo mật & ẩn danh

- GitHub Pages là hosting tĩnh nên **không chứa khóa Google**. Không thêm API key hoặc OAuth token vào repo.
- Endpoint chỉ **đọc** và chỉ trả các trường trong allowlist. Không trả: tên, mã nhân viên, email, số điện thoại, danh bạ nhân sự, nhật ký phê duyệt, ghi chú/nhật ký.
- Tên người (PIC, người thực hiện) được thay bằng **bí danh ngẫu nhiên nhưng ổn định**, lưu trong Script Properties của Apps Script. Email và số điện thoại trong văn bản tự do bị che.
- Endpoint được đặt **"Anyone"**, nên chỉ phù hợp với dữ liệu mẫu đã lọc. **Không dùng endpoint này cho dữ liệu sản xuất của công ty.**
- ID của Google Sheet và URL endpoint nằm trong repo công khai. Hãy kiểm tra quyền chia sẻ của sheet nguồn (không để "Anyone with the link" nếu không cần).

## 7. Cài đặt & triển khai

### GitHub Pages
**Settings → Pages → Build and deployment → Source: GitHub Actions.** Mỗi lần push lên `main`, workflow `deploy-pages.yml` sẽ publish thư mục `site/`.

### Apps Script (dữ liệu live)
1. Mở https://script.google.com bằng tài khoản có quyền xem sheet nguồn, tạo project và dán `apps-script/Code.gs`.
2. **Deploy → New deployment → Web app**; *Execute as*: tài khoản của bạn; *Who has access*: **Anyone**.
3. Cấp quyền đọc spreadsheet, copy URL Web App.
4. Dán URL vào `site/config.js` (`window.KPI_DATA_ENDPOINT`), commit và push.

> **Khi sửa `Code.gs`:** dán lại code rồi **Deploy → Manage deployments → ✎ → Version: New version → Deploy**.
> Chọn "New deployment" sẽ tạo URL mới và dashboard vẫn đọc URL cũ.

### Tạo lại snapshot dự phòng
```bash
python scripts/build-public-sample.py "đường/dẫn/DB KPI & Công việc.xlsx" site/data-snapshot.js
```

## 8. Phát triển

- Mọi giao diện nằm trong `site/index.html`; chỉnh sửa trực tiếp, mở file bằng trình duyệt để thử (không cần build).
- Các hàm dùng chung: `niceAxis` / `yGrid` (trục số nguyên), `statusColor`, `tlState` (4 trạng thái), `isOverdue`, `isClosed`, `stackedOwnerChart`, `horizontalChart`, `treeTimeline`.
- Kích thước biểu đồ cột/đường dùng chung hằng số `V` (viewBox 600×214) để chữ đồng nhất giữa các tab.
- Kiểm tra cú pháp nhanh: trích khối `<script>` cuối của `index.html` và chạy `node --check`.

## 9. Lịch sử phiên bản & quay lại

Mỗi thay đổi lớn là một **git tag** (xem `CHANGELOG.md`). Quay lại một phiên bản (giữ nguyên lịch sử):

```bash
git checkout v1.7.1-chan-doan-cap-3 -- site/index.html
git commit -m "Quay lai v1.7.1"
git push origin main
```

## 10. Hạn chế đã biết

- `build-public-sample.py` chưa xuất sheet `LamViec`, nên **snapshot dự phòng chỉ có 2 cấp**; cấp 3 của Timeline chỉ hiện khi Apps Script (bản mới) trả dữ liệu live.
- Timeline chỉ **xem**, không kéo thả hay sửa ngày (dữ liệu nguồn là Google Sheets, chỉ đọc).
- Công việc chi tiết (`LamViec`) không có cột tiến độ.
- Màn hình điện thoại hiển thị được nhưng Timeline khá chật (cột tên 300px, ẩn cột Tiến độ và Phụ trách).

## Tên nhân viên

Apps Script trả **tên thật** mặc định (cần Deploy → New version sau khi sửa `Code.gs`). Tùy chọn trong Script properties:

| Property | Giá trị | Tác dụng |
|---|---|---|
| `SHOW_REAL_NAMES` | `false` | Ép trả tên mã hóa cho mọi người |
| `ACCESS_CODE` | mã bí mật | Chỉ trả tên thật khi người xem bấm **🔑 Tên thật** và nhập đúng mã |

Lưu ý: endpoint là public, khi chưa có đăng nhập/phân quyền thì ai có link đều đọc được tên thật.
