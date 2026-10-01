# KPI & Công việc — GitHub Pages preview

This repository package publishes the self-contained static UI preview from `site/index.html`.

- The page has no external runtime dependencies.
- It uses clearly labeled synthetic sample data and does not connect to the company Google Sheet.
- The React/TanStack module and authenticated application are not included in this static Pages deployment.
- The Pages workflow publishes `site/` on pushes to `main`.

In the GitHub repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The first successful workflow run will publish the preview URL in the `github-pages` environment.
