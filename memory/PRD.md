# SmartWorld Analytics - PRD

## Original Problem Statement
Create a case management dashboard using the uploaded Excel file (Case Management Report), referencing a provided dashboard image. Show every aspect in the report that is possible. The Excel will be managed manually (upload when updates needed).

## Architecture
- **Backend**: FastAPI (Python) - Excel-based data processing with in-memory caching
- **Frontend**: React.js with Recharts, Tailwind CSS, Radix UI
- **Data Source**: Excel files (ZALR.xlsx, Sales.xlsx, CaseManagement.xlsx)
- **No Database Required**: All data is read from Excel files

## Core Requirements (Static)
1. Case Management Dashboard with KPIs, charts, and detailed table
2. Filters: Case Type, Status, Origin, Area, Sub Area, Owner, HOD, Team Leader, Project, Priority
3. Toggle filters: Beyond/Within TAT, Exclusion/Inclusion, Above/Within 24 Hrs
4. Manual Excel upload for data updates
5. Existing ZALR and Sales dashboards maintained

## What's Been Implemented (Jan 14, 2026)
- **Case Management API** (`case_api.py`): /api/cases/data, /api/cases/filters, /api/cases/table, /api/cases/upload, /api/cases/download
- **Case Management Dashboard** (`CaseManagement.js`): Full dashboard with:
  - 6 KPI cards (Total, Open, Closed, Escalated, HNI, Legal)
  - Case Type pie chart
  - Status breakdown horizontal bars
  - Case Origin horizontal bar chart
  - Cases by Case Owner bar chart
  - Area/Sub Area summary table
  - Project breakdown
  - Priority pie chart
  - Team Leader bar chart
  - Response Time / Resolution Time / Applicability breakdown
  - Detailed case table with pagination, search, and 14 columns
- **10 sidebar filter dropdowns** and **6 header toggle pills**
- **Excel upload/download** functionality
- **Data caching** for 92K+ row performance
- **Landing page** updated with Case Management as a live module
- **Fonts**: Chivo + IBM Plex Sans for enterprise look

## Testing Status
- Backend: 100% (14/14 tests passed)
- Frontend: 100% (all features working)

## Prioritized Backlog
- P0: None (MVP complete)
- P1: Date range filtering, Excel template download
- P2: Export filtered data to Excel, email reports
- P3: Real-time data sync, user authentication

## Next Tasks
- Add date range filter for Date/Time Opened
- Add ability to export filtered results to Excel
- Add more chart types (trend over time)
