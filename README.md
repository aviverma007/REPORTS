# SmartWorld Developers — Analytics Portal

A full-stack Business Intelligence dashboard built with **React + FastAPI**.

## Stack
- **Frontend**: React 19, Tailwind CSS, Recharts, shadcn/ui
- **Backend**: FastAPI (Python), uvicorn, openpyxl, pandas

---

## Quick Start

### Option 1 — Windows (double-click)
```
start.bat
```

### Option 2 — Linux/Mac
```bash
chmod +x start.sh && ./start.sh
```

### Option 3 — Manual

**Backend** (Terminal 1):
```bash
cd backend
pip install fastapi uvicorn python-dotenv openpyxl pandas python-multipart starlette
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

Open → **http://localhost:3000**

---

## URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8001 |
| API Docs | http://localhost:8001/docs |

---

## Data Files
Place your Excel files in `backend/data/`:
- `ZALR.xlsx` — Procurement / Cost data
- `Sales.xlsx` — Sales data
- `CaseManagement.xlsx` — Case management data

Upload directly via the **Upload** button in the app.

---

## Reports Available
- ✅ ZALR Cost Dashboard
- ✅ Sales Dashboard
- ✅ Case Management
- 🔜 Project Progress, Vendor Performance, Budget Variance, HR Analytics, Finance MIS
