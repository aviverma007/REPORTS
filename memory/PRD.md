# SmartWorld Developers Analytics Portal - PRD

## Original Problem Statement
Convert a single-page HTML analytics portal (cost.html) into a full-stack application using React + FastAPI, storing data in Excel (.xlsx) on the server with manual update capability via file upload.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Recharts + Lucide React
- **Backend**: FastAPI + openpyxl (Excel read/write)
- **Data Storage**: Excel file (.xlsx) on server at `/app/backend/data/ZALR.xlsx`
- **No Authentication**: Open access portal

## User Personas
- **Operations Manager**: Views cost dashboards, filters by plant/WBS/project type
- **Data Admin**: Uploads updated Excel files to refresh dashboards
- **Internal Staff**: Views landing page and report modules

## Core Requirements
1. Landing page with company branding, stats, and report module cards
2. ZALR Cost Dashboard with 7 KPI cards, 7 chart types, filters, and WBS summary table
3. Excel upload page with drag-and-drop file upload
4. Data stored in .xlsx format on server
5. Light theme with Swiss High-Contrast design

## What's Been Implemented (Jan 2026)
- [x] Landing page with hero section, stats bar, 8 report module cards
- [x] ZALR Cost Dashboard with full sidebar filters (Plant, WBS, PO, Year, Month, Project Type)
- [x] 7 KPI cards (WBS Count, Budget, PO Count, Ordered, Delivered, Invoiced, Still to Deliver)
- [x] 7 chart components (Project Compare, Pending Donut, Monthly Trend, Plant Bar, WBS Pie, Yearly Stacked, WBS Grouped Bar)
- [x] Plant Budget Utilisation gauge bars
- [x] WBS Summary table (top 25 by ordered value)
- [x] Excel upload with drag-and-drop + download current data
- [x] Coming Soon modal for inactive modules
- [x] Backend APIs: /api/data, /api/stats, /api/modules, /api/filters, /api/upload, /api/download
- [x] Seed data from original HTML (8,146 rows, 313 WBS elements, 17 plants)

## Prioritized Backlog
### P0 (Critical)
- None remaining

### P1 (Important)
- Project Progress Report module (with sample data)
- Budget Variance Report module (with sample data)

### P2 (Nice to Have)
- Data export to PDF
- Dashboard print-friendly mode
- Filter URL persistence (shareable filtered views)
- Historical file version tracking

## Next Tasks
1. Build Project Progress Report module with sample data
2. Build Budget Variance Report module with sample data
3. Add CSV export from dashboard
