## Analytics & Reports

This folder contains simple analytics endpoints and a basic admin dashboard.

- GET /api/analytics/summary?days=30 — returns revenue, ordersCount, scansCount for the last `days` days.
- POST /api/qr/analytics/export — body: { startDate, endDate } returns a CSV of ScanEvent rows between the dates.
- GET /api/reports/generate — generates a monthly report and emails it to ADMIN_EMAIL (set in env).

Setup tips
- Ensure prisma has scan_events, orders and payments tables (existing schema).
- Set ADMIN_EMAIL env var to receive automated reports.
- Use ngrok or your deployed environment to fetch CSV and test report email.
