# Lịch sử phiên bản

Mỗi phiên bản là một git tag. Xem toàn bộ: `git tag` hoặc GitHub → Releases/Tags.

| Tag | Nội dung | Cách quay lại bản TRƯỚC phiên bản này |
|---|---|---|
| `v1.0-baseline` | Trạng thái trước các bổ sung: biểu đồ đã đồng nhất, hàng đầu thu gọn, "Dự án theo phòng ban" đứng trước "theo nhân sự" | — |
| `v1.1-tien-do-ke-hoach` | Tab Dự án: biểu đồ **Tiến độ thực tế so với kế hoạch** (ngưỡng chậm `LAG_THRESHOLD = 20` điểm %) | `git revert 2e599aa` |
| `v1.2-tab-cong-viec` | Tab Công việc: **Khối lượng việc đang mở theo nhân sự**, **Thời gian trễ hạn** (trước đây tên "Tuổi nợ quá hạn"), **Top dự án quá hạn**. Bỏ biểu đồ "Số công việc theo nhân sự" (đã được thay bằng biểu đồ khối lượng) | `git revert cb0b441 e69b7df` |
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
