# Lịch sử phiên bản

Mỗi phiên bản là một git tag. Xem toàn bộ: `git tag` hoặc GitHub → Releases/Tags.

| Tag | Nội dung | Cách quay lại bản TRƯỚC phiên bản này |
|---|---|---|
| `v1.0-baseline` | Trạng thái trước các bổ sung: biểu đồ đã đồng nhất, hàng đầu thu gọn, "Dự án theo phòng ban" đứng trước "theo nhân sự" | — |
| `v1.1-tien-do-ke-hoach` | Tab Dự án: biểu đồ **Tiến độ thực tế so với kế hoạch** (ngưỡng chậm `LAG_THRESHOLD = 20` điểm %) | `git revert 2e599aa` |
| `v1.2-tab-cong-viec` | Tab Công việc: **Khối lượng việc đang mở theo nhân sự**, **Thời gian trễ hạn** (trước đây tên "Tuổi nợ quá hạn"), **Top dự án quá hạn**. Bỏ biểu đồ "Số công việc theo nhân sự" (đã được thay bằng biểu đồ khối lượng) | `git revert cb0b441 e69b7df` |
| `v1.13.1-donut-tooltip` | Biểu đồ tròn: bỏ số ở chú thích; rê chuột vào lát hoặc chú thích hiện tooltip thành phần, tổng và % | `git revert <commit>` |
| `v1.20.2-sua-vung-bam-icon` | Sửa lỗi bấm nút sổ xuống (›) lại mở AppSheet: icon ✎/📄 bị CSS chung của biểu đồ SVG (`min-width:280px`) làm phình vùng bấm; đặt kích thước icon 14px, `min-width:0`, `overflow:hidden` | `git revert <commit>` |
| `v1.20.1-icon-bao-cao-cuoi-bang` | Biểu tượng 📄 link báo cáo chuyển về cột hẹp 28px ở mép phải bảng trái (giáp biểu đồ), thẳng hàng mọi dòng; ✎ sửa vẫn ở cạnh tên | `git revert <commit>` |
| `v1.20-icon-bao-cao-va-sua` | Bỏ cột "Báo cáo" ở Timeline; link báo cáo thành biểu tượng 📄 ngay sau tên dòng; thêm biểu tượng ✎ ở dòng dự án/công việc/chi tiết chưa hoàn thành mở AppSheet để sửa (cấu hình `KPI_APPSHEET` trong `config.js`; đọc thêm `LamViecID`) | `git revert <commit>` |
| `v1.19.1-client-id` | Điền OAuth Client ID để đọc trực tiếp Google Sheets | `git revert <commit>` |
| `v1.19-bo-apps-script` | Bỏ endpoint Apps Script khỏi `config.js`; chỉ đọc trực tiếp Google Sheets (cần `KPI_GOOGLE_CLIENT_ID`); cập nhật các thông báo không còn nhắc Apps Script | `git revert <commit>` |
| `v1.18-cot-link-bao-cao` | Timeline có cột "Báo cáo" (giữa Phụ trách và biểu đồ): dự án/công việc có `LinkBaoCao` hiện nút 🔗 Mở (mở tab mới, chỉ nhận http/https); đọc cột từ sheet DuAn + CongViec (cả `sheets-direct.js` và `Code.gs`); ẩn/hiện được trong ⚙ Cột | `git revert <commit>` |
| `v1.17-doc-truc-tiep-sheets` | Đọc trực tiếp Google Sheets bằng đăng nhập Google (OAuth + Sheets API, file `site/sheets-direct.js`, cấu hình trong `config.js`), không cần Apps Script; **sửa lỗi `stOK is not defined` của v1.16** làm báo "Dữ liệu nguồn không hợp lệ" khi nguồn có công việc chi tiết | `git revert <commit>` |
| `v1.16.1-cho-du-lieu-40s` | Thời gian chờ Apps Script 15 → 40 giây; thông báo lỗi tách rõ: hết thời gian / không tải được / trả về trang không phải dữ liệu | `git revert <commit>` |
| `v1.16-trang-thai-day-du` | Bộ lọc Trạng thái có đủ 6 trạng thái cố định (Chưa thực hiện, Đang thực hiện, Chờ duyệt, Hoàn thành, Hủy, Pending); Pending và Hủy là trạng thái riêng (xám), Chờ duyệt màu cam; mặc định không chọn Hủy và Pending; lọc áp dụng cả dự án, công việc và công việc chi tiết (cha không khớp thì ẩn); nút Đặt lại trả về mặc định | `git revert <commit>` |
| `v1.15.1-bo-tim-kiem-goi-y-han` | Bỏ ô Tìm kiếm khỏi bộ lọc (bấm biểu đồ/dòng dự án giờ lọc bằng bộ lọc Dự án); thêm nhãn "Còn N ngày / Hôm nay / Trễ N ngày" cạnh ngày hạn (bảng, tab gộp, tooltip Timeline) và dòng chú giải quy tắc "Sắp đến hạn ≤ 7 ngày" dưới bộ lọc | `git revert <commit>` |
| `v1.15-tinh-theo` | Thêm ô **Tính theo** cạnh Từ/Đến ngày: Đang diễn ra trong kỳ (mặc định, giao nhau) / Hạn kết thúc trong kỳ / Ngày bắt đầu trong kỳ; nhãn khoảng ngày hiển thị chế độ đang dùng | `git revert <commit>` |
| `v1.14.1-loc-du-an-moi-tab` | Bộ lọc **Dự án** hiện ở mọi tab (KPI, Dự án, ...); bộ lọc **Công việc** vẫn chỉ ở tab có công việc | `git revert <commit>` |
| `v1.14-bo-loc-kpi-du-an-cong-viec` | "Sắp đến hạn" = hạn trong 0–7 ngày tới (tính theo ngày, hằng số `SOON_DAYS`), quá hạn = hạn trước hôm nay (chỉ dùng trạng thái nhập tay khi thiếu ngày hạn); thêm bộ lọc **Có trong KPI** (Cả hai/Có/Không, cần `hasKpi` từ Apps Script), **Dự án** và **Công việc** nhiều giá trị (chỉ hiện ở tab có công việc: Công việc, Dự án & Công việc, Timeline, Cảnh báo) | `git revert <commit>` |
| `v1.13-bieu-do-cot` | Biểu đồ chồng: nhãn tổng + tooltip thành phần/tổng/% ; biểu đồ tròn hiện giá trị trên lát; tiêu đề bảng luôn cố định khi cuộn (sửa lỗi do v1.12); danh sách ⚙ Cột thêm được cột bổ sung (Phòng ban, KPI, Ngày bắt đầu, Năm học…) cho bảng Dự án/Công việc, tab gộp và Timeline; nút ◧ thu gọn thanh bên trái | `git revert <commit>` |
| `v1.12-cot-ten-that` | Kéo đổi độ rộng từng cột và ẩn/hiện cột (nút ⚙ Cột) cho mọi bảng, Timeline và tab Dự án & Công việc, lưu trên trình duyệt, cột quan trọng cố định; tên nhân viên thật tùy chọn qua Script Properties `SHOW_REAL_NAMES` / `ACCESS_CODE` (nút 🔑 Tên thật nhập mã) — cần deploy lại Apps Script | `git revert <commit>` |
| `v1.11-bo-loc-da-chon` | Bộ lọc Năm học / Phòng ban / Nhân viên / Trạng thái chọn nhiều giá trị (tick); năm học 01/07–30/06, mặc định "Cả năm học"; sửa lệch ngày do múi giờ khi chọn kỳ; tab Cảnh báo thêm phần Dự án (trễ hạn, hết hạn trong tháng) | `git revert <commit>` |
| `v1.10-tab-gop` | Tab **Dự án & Công việc** một trang: dải chỉ số (bấm để lọc), danh sách dự án bên trái xếp theo rủi ro, bảng công việc → công việc chi tiết bên phải, biểu đồ thu gọn; giữ nguyên tab Dự án và Công việc cũ | `git revert <commit>` hoặc quay về tag `v1.9.1-truoc-gop-tab` |
| `v1.9-timeline-gon` | Tab Timeline: tên dự án **ở mọi tab** lấy từ cột `NhomCongViec` của `DuAn` (`Code.gs` và `build-public-sample.py`; cần deploy lại Apps Script); cột Tiến độ chỉ hiện %, bỏ thanh progress; thêm nút **Mở đến công việc** (mở Dự án → Công việc, giữ đóng cấp chi tiết) | `git revert 347eea7` |
| `v1.8.1-readme` | Thêm `README.md` mô tả dự án (kiến trúc, dữ liệu, quy tắc nghiệp vụ, triển khai, quay lại phiên bản). Không thay đổi mã | `git revert 3c68469` |
| `v1.8-loc-nhanh-tien-do` | Tab Công việc: "Số công việc theo dự án" chia theo Chưa thực hiện / Đang thực hiện / Quá hạn (rộng toàn hàng), bỏ "Top dự án có nhiều việc quá hạn", "Thời gian trễ hạn" lên cạnh "Khối lượng theo nhân sự". Tab Timeline: thêm cột **Tiến độ** (trước cột Trạng thái) và **lọc nhanh** (Công việc tuần này / tháng này, Hết hạn tuần này / tháng này) | `git revert a7d51fb` |
| `v1.7.1-chan-doan-cap-3` | Timeline: hiện cảnh báo khi nguồn dữ liệu chưa trả cấp 3 (hoặc không gắn được `LamViec` vào `CongViec`); `Code.gs` trả thêm `meta` để chẩn đoán | `git revert 242941b` |
| `v1.7-timeline-3-cap` | Tab **Timeline** dạng cây Dự án → Công việc → Công việc chi tiết (sheet `LamViec`): mở/đóng từng cấp, thu phóng Tuần/Tháng/Quý, vạch Hôm nay, cảnh báo quá hạn. `Code.gs` đọc thêm `LamViec` và trả `details` (cần deploy lại Apps Script) | `git revert 8b16b4f` |
| `v1.6-kpi-bo-cuc-cot` | Tab KPI: cột trái (KPI theo phòng ban + Trạng thái dự án) hẹp hơn, bảng "Dự án theo KPI phòng ban" rộng và cao hơn (không còn thanh cuộn ngang), donut "Trạng thái dự án" cao hơn | `git revert b124281` |
| `v1.5-kpi-phong-ban-lon-hon` | Tab KPI: thu nhỏ panel "Trạng thái dự án", mở rộng "KPI theo phòng ban" (hàng cao hơn, ghi chú phòng ban chưa triển khai nằm ngoài vùng cuộn, bỏ thanh cuộn ngang) | `git revert 9239fe9` |
| `v1.4-doi-cho-thoi-gian-tre-han` | Tab Công việc: đổi chỗ "Số công việc theo dự án" (lên hàng 1) và "Thời gian trễ hạn" (xuống hàng 2); đổi tên "Tuổi nợ quá hạn" → "Thời gian trễ hạn" | `git revert 7d43502` |
| `v1.3-an-phong-ban-trong` | Tab KPI: ẩn phòng ban chưa triển khai (trọng số = 0 và số dự án = 0), ghi chú dưới biểu đồ | `git revert 753a5f8` |

## Quay lại một phiên bản

Quay lại toàn bộ trạng thái của một tag (giữ lịch sử, an toàn nhất):

```bash
git checkout v1.0-baseline -- site/index.html
git commit -m "Quay lai v1.0-baseline"
git push origin main
```

Hoặc trên GitHub: mở tag/commit → mở `site/index.html` → **Raw** → dán lại vào file hiện tại và commit.
