# KPI & Công việc — GitHub Pages preview

This repository package publishes the static dashboard from `site/index.html`.

- The page has no external runtime dependencies.
- Until Apps Script is deployed, it uses an anonymized, filtered snapshot built from the supplied workbook.
- `apps-script/Code.gs` reads selected columns from the KPI, employee KPI, project, and task tabs and returns an anonymized response. It does not expose the HR directory, approval log, employee codes, names, email addresses, phone numbers, or notes/logs.
- The React/TanStack module and authenticated application are not included in this static Pages deployment.
- The Pages workflow publishes `site/` on pushes to `main`.

To enable live sample-data refresh, follow [`apps-script/README.md`](apps-script/README.md) and paste the deployed Web App URL into `site/config.js`. The public endpoint returns only filtered sample fields; do not use it for company production data.

In the GitHub repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The first successful workflow run will publish the preview URL in the `github-pages` environment.
