# Connect the filtered sample to Google Sheets

GitHub Pages is static hosting, so it cannot safely hold Google credentials. This Apps Script endpoint reads only `KPIPhongBan`, `KPINhanVien`, `DuAn`, and `CongViec`, then returns a small allowlisted response. It does not return employee names, employee codes, email addresses, phone numbers, HR directory rows, approval logs, or free-text logs/notes. Employee names are replaced with random stable aliases stored in the script's private properties.

## One-time setup

1. Open [Google Apps Script](https://script.google.com/) while signed in to the account that can view the spreadsheet.
2. Create a project and paste `Code.gs` into its editor.
3. Choose **Deploy → New deployment → Web app**.
4. Set **Execute as** to your account and **Who has access** to **Anyone**. This intentionally makes only the filtered sample response public; do not reuse this endpoint for company production data.
5. Authorize the script to read the spreadsheet. Copy the deployed Web App URL.
6. Put that URL in `site/config.js` as the value of `window.KPI_DATA_ENDPOINT`, then commit and push the change to `main`.

The page currently has a filtered, anonymized snapshot from the workbook as a fallback. After `site/config.js` contains the deployed URL, the page requests fresh data when opened or when **Làm mới dữ liệu** is clicked. Do not add a Google API key or OAuth token to the repository.

## Refresh behavior

The endpoint is read-only. KPI percentages and result labels come from the source columns `PhanTramDatKPI` and `KetQua`; project progress comes from `PhanTram`; task progress comes from `TienDoCVDone`. The web page does not recalculate the official KPI result. The snapshot builder accepts a local workbook path and exports only the same sanitized fields:

```powershell
python scripts/build-public-sample.py "C:\path\to\DB KPI & Công việc.xlsx" site/data-snapshot.js
```
