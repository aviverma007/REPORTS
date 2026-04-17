from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from typing import Optional
import openpyxl
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI()
api_router = APIRouter(prefix="/api")

DATA_DIR = ROOT_DIR / 'data'
DATA_DIR.mkdir(exist_ok=True)
ZALR_FILE = DATA_DIR / 'ZALR.xlsx'

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def ensure_seed_data():
    if not ZALR_FILE.exists():
        from seed_data import generate_seed_excel
        generate_seed_excel()


# Cache for ZALR data
_zalr_cache = {"rows": None, "budgets": None, "mtime": 0}


def read_zalr_excel():
    ensure_seed_data()
    mtime = ZALR_FILE.stat().st_mtime
    if _zalr_cache["rows"] is not None and _zalr_cache["mtime"] == mtime:
        return _zalr_cache["rows"], _zalr_cache["budgets"]

    wb = openpyxl.load_workbook(ZALR_FILE, read_only=True, data_only=True)
    sheet_names = wb.sheetnames

    # Detect format: old (ZALR_Data + WBS_Budget) vs new (Sheet1 with all columns)
    if 'ZALR_Data' in sheet_names:
        # OLD FORMAT
        ws = wb['ZALR_Data']
        headers = [cell.value for cell in next(ws.iter_rows(min_row=1, max_row=1))]
        rows = []
        for row in ws.iter_rows(min_row=2, values_only=True):
            row_dict = {}
            for i, val in enumerate(row):
                if i < len(headers):
                    row_dict[headers[i]] = val
            rows.append(row_dict)
        budgets = {}
        if 'WBS_Budget' in sheet_names:
            ws2 = wb['WBS_Budget']
            for row in ws2.iter_rows(min_row=2, values_only=True):
                if row[0]:
                    budgets[str(row[0])] = row[2] or 0
    else:
        # NEW FORMAT - single sheet with columns like WBS, Plant_WBS, Budget, etc.
        ws = wb[sheet_names[0]]
        headers = [cell.value for cell in next(ws.iter_rows(min_row=1, max_row=1))]
        raw_rows = []
        for row in ws.iter_rows(min_row=2, values_only=True):
            d = {}
            for i, val in enumerate(row):
                if i < len(headers) and headers[i]:
                    d[headers[i]] = val
            raw_rows.append(d)

        # Map new columns to the normalized names used by all endpoints
        rows = []
        budgets = {}

        def safe_num(v):
            if v is None:
                return 0
            if isinstance(v, (int, float)):
                return v
            try:
                return float(str(v).replace(',', ''))
            except (ValueError, TypeError):
                return 0

        for d in raw_rows:
            import datetime
            doc_date = d.get('Document Date')
            yr, mo = None, None
            if isinstance(doc_date, datetime.datetime):
                yr = doc_date.year
                mo = doc_date.month
            elif isinstance(doc_date, str) and doc_date:
                try:
                    from datetime import datetime as dt
                    parsed = dt.strptime(doc_date.split(' ')[0], '%Y-%m-%d')
                    yr, mo = parsed.year, parsed.month
                except Exception:
                    pass

            ordered_gst = safe_num(d.get('Ordered with GST'))
            invoiced = safe_num(d.get('Invoiced Value') or d.get('Invoiced with GST') or 0)
            still_del = safe_num(d.get('Still to be Delivered Value') or d.get('Still to be Delivered with GST') or 0)
            # Support multiple column name formats for delivered
            actual = safe_num(
                d.get('Delivered with GST') or
                d.get('Actual PO Value') or
                d.get('Total Actual') or 0
            )
            still_inv = safe_num(
                d.get('Still to be Invoiced Value') or
                d.get('Still to be Invoiced with GST') or
                max(0, ordered_gst - invoiced)
            )

            wbs_key = d.get('WBS', '') or ''

            mapped = {
                'WBS Element': wbs_key,
                'WBS Description': d.get('WBS Description', ''),
                'Plant': str(d.get('Plant_WBS', '') or ''),
                'Plant Name': d.get('Plant Name', ''),
                'Purchasing Document': d.get('Purchasing Document', ''),
                'Project/Non-Project': ('Project' if str(d.get('Project/Non-Project', d.get('PROJECT/NON-PROJECT', ''))).upper().startswith('PROJECT') and not str(d.get('Project/Non-Project', d.get('PROJECT/NON-PROJECT', ''))).upper().startswith('NON') else 'Non-Project'),
                'Ordered with GST': ordered_gst,
                'Delivered with GST': actual,
                'Invoiced with GST': invoiced,
                'Still to Deliver GST': still_del,
                'Still to Invoice': still_inv,
                'Year': yr,
                'Month': mo,
                'Budget': safe_num(d.get('Budget')),
                'Vendor Name': d.get('Vendor Name', ''),
                'Net Price': safe_num(d.get('Net Price')),
                'Ordered Value': safe_num(d.get('Ordered Value')),
                'Document Date': doc_date,
                'Short Text': d.get('Short Text', ''),
                'Document Type': d.get('Document Type', ''),
                'Profit Center': d.get('Profit Center', ''),
                'Business Area': d.get('Business Area', ''),
            }
            rows.append(mapped)

            # Build budgets from Budget column (use max value per WBS)
            if wbs_key:
                bud_val = safe_num(d.get('Budget'))
                if bud_val and (wbs_key not in budgets or bud_val > budgets[wbs_key]):
                    budgets[wbs_key] = bud_val

    wb.close()
    _zalr_cache["rows"] = rows
    _zalr_cache["budgets"] = budgets
    _zalr_cache["mtime"] = mtime
    return rows, budgets


PLANT_NAMES = {
    "1000": "SWD One DXP-Ph1 Res.", "1010": "SmartWorld Developer", "1011": "SWD OneDXP-Ph2 Stret",
    "1012": "One DXP-Commercial", "1013": "SWD One DXP-Ph2 Res.", "1014": "One DXP Phase-5",
    "1015": "One DXP Sales Gallery", "1070": "Riverday Resi.-69", "1071": "Riverday Retail-69",
    "1072": "Trump Tower", "1073": "IFC 11th Floor", "1074": "Lead Apartment-Trump",
    "1090": "Anuvridhi Head Offc.", "2000": "Smartworld Heights", "2010": "ETSY Developer P.Ltd",
    "2011": "SWD Central Office", "2012": "Sales Gallery", "2070": "Manesar M11-HO",
    "2071": "Manesar M11-Projec", "2072": "Manesar M11-Commer.", "2080": "Topshelf Builders Re",
    "3010": "Glorii Education-HO", "3070": "Sector 98 Noida HO", "3071": "SWD Residencies",
    "3072": "SWD Le Courtyard", "3073": "Smartworld Suites", "3074": "Sector 98 Noida SGE",
}


def process_data(rows, budgets, plant=None, wbs=None, po=None, proj_type=None, year=None, month=None):
    filtered = rows
    if plant:
        plant_set = set(plant.split(','))
        filtered = [r for r in filtered if str(r.get('Plant', '')) in plant_set]
    if wbs:
        wbs_set = set(wbs.split(','))
        filtered = [r for r in filtered if r.get('WBS Element', '') in wbs_set]
    if po:
        po_set = set(po.split(','))
        filtered = [r for r in filtered if str(r.get('Purchasing Document', '')) in po_set]
    if proj_type:
        filtered = [r for r in filtered if r.get('Project/Non-Project', '') == proj_type]
    if year:
        year_set = set(year.split(','))
        filtered = [r for r in filtered if str(r.get('Year', '')) in year_set]
    if month:
        month_set = set(month.split(','))
        filtered = [r for r in filtered if str(r.get('Month', '')) in month_set]
    return filtered


def aggregate(rows_list):
    wbs_map = {}

    for r in rows_list:
        w = r.get('WBS Element')
        if not w:
            continue

        if w not in wbs_map:
            wbs_map[w] = {
                "ordered": 0,
                "delivered": 0,
                "invoiced": 0,
                "still_to_invoice": 0,
                "still_to_deliver": 0
            }

        # Group all rows under same WBS
        wbs_map[w]["ordered"] += r.get('Ordered with GST', 0) or 0
        wbs_map[w]["delivered"] += r.get('Delivered with GST', 0) or 0
        wbs_map[w]["invoiced"] += r.get('Invoiced with GST', 0) or 0
        wbs_map[w]["still_to_invoice"] += r.get('Still to Invoice', 0) or 0
        wbs_map[w]["still_to_deliver"] += r.get('Still to Deliver GST', 0) or 0

    # Final totals (each WBS counted once)
    return {
        "ordered": sum(v["ordered"] for v in wbs_map.values()),
        "delivered": sum(v["delivered"] for v in wbs_map.values()),
        "invoiced": sum(v["invoiced"] for v in wbs_map.values()),
        "still_to_invoice": sum(v["still_to_invoice"] for v in wbs_map.values()),
        "still_to_deliver": sum(v["still_to_deliver"] for v in wbs_map.values())
    }


def get_unique_wbs(rows_list):
    return list(set(r.get('WBS Element', '') for r in rows_list if r.get('WBS Element')))


@api_router.get("/")
async def root():
    return {"message": "SmartWorld Analytics API"}


@api_router.get("/data")
async def get_data(
    plant: Optional[str] = None, wbs: Optional[str] = None,
    po: Optional[str] = None, proj_type: Optional[str] = None,
    year: Optional[str] = None, month: Optional[str] = None
):
    rows, budgets = read_zalr_excel()
    filtered = process_data(rows, budgets, plant, wbs, po, proj_type, year, month)

    proj_rows = [r for r in filtered if r.get('Project/Non-Project') == 'Project']
    non_rows = [r for r in filtered if r.get('Project/Non-Project') == 'Non-Project']

    tot = aggregate(filtered)
    tp = aggregate(proj_rows)
    tn = aggregate(non_rows)

    wbs_all = get_unique_wbs(filtered)
    wbs_proj = get_unique_wbs(proj_rows)
    wbs_non = get_unique_wbs(non_rows)

    po_all = list(set(str(r.get('Purchasing Document', '')) for r in filtered if r.get('Purchasing Document')))

    bud_all = sum(budgets.get(w, 0) for w in wbs_all)
    bud_proj = sum(budgets.get(w, 0) for w in wbs_proj)
    bud_non = sum(budgets.get(w, 0) for w in wbs_non)

    # Monthly trend
    monthly = {}
    for r in filtered:
        yr, mo = r.get('Year'), r.get('Month')
        if not yr or not mo:
            continue
        key = f"{yr}-{int(mo):02d}"
        if key not in monthly:
            monthly[key] = {"year": yr, "month": int(mo), "ord_proj": 0, "del_proj": 0, "ord_non": 0, "del_non": 0}
        is_proj = r.get('Project/Non-Project') == 'Project'
        if is_proj:
            monthly[key]["ord_proj"] += r.get('Ordered with GST', 0) or 0
            monthly[key]["del_proj"] += r.get('Delivered with GST', 0) or 0
        else:
            monthly[key]["ord_non"] += r.get('Ordered with GST', 0) or 0
            monthly[key]["del_non"] += r.get('Delivered with GST', 0) or 0
    monthly_sorted = sorted(monthly.values(), key=lambda x: x['year'] * 100 + x['month'])

    # Plant-wise
    plant_data = {}
    for r in filtered:
        pl = str(r.get('Plant', ''))
        if pl not in plant_data:
            plant_data[pl] = {"plant": pl, "ordered": 0, "delivered": 0, "still_to_deliver": 0}
        plant_data[pl]["ordered"] += r.get('Ordered with GST', 0) or 0
        plant_data[pl]["delivered"] += r.get('Delivered with GST', 0) or 0
        plant_data[pl]["still_to_deliver"] += r.get('Still to Deliver GST', 0) or 0
    plant_sorted = sorted(plant_data.values(), key=lambda x: x['ordered'], reverse=True)

    # WBS budget pie (top 10)
    wbs_bud_list = []
    for w in wbs_all:
        b = budgets.get(w, 0)
        if b > 0:
            wbs_bud_list.append({"wbs": w, "budget": b, "is_project": w.startswith('RE/')})
    wbs_bud_list.sort(key=lambda x: x['budget'], reverse=True)

    # Yearly stacked
    yearly = {}
    for r in filtered:
        yr = r.get('Year')
        if not yr:
            continue
        yr = str(yr)
        if yr not in yearly:
            yearly[yr] = {"year": yr, "ordered": 0, "delivered": 0, "invoiced": 0, "still_to_deliver": 0}
        yearly[yr]["ordered"] += r.get('Ordered with GST', 0) or 0
        yearly[yr]["delivered"] += r.get('Delivered with GST', 0) or 0
        yearly[yr]["invoiced"] += r.get('Invoiced with GST', 0) or 0
        yearly[yr]["still_to_deliver"] += r.get('Still to Deliver GST', 0) or 0
    yearly_sorted = sorted(yearly.values(), key=lambda x: x['year'])

    # WBS ordered top 10
    wbs_ord_map = {}
    for r in filtered:
        w = r.get('WBS Element', '')
        if w not in wbs_ord_map:
            wbs_ord_map[w] = {"wbs": w, "ordered": 0, "delivered": 0, "still_to_deliver": 0, "is_project": r.get('Project/Non-Project') == 'Project'}
        wbs_ord_map[w]["ordered"] += r.get('Ordered with GST', 0) or 0
        wbs_ord_map[w]["delivered"] += r.get('Delivered with GST', 0) or 0
        wbs_ord_map[w]["still_to_deliver"] += r.get('Still to Deliver GST', 0) or 0
    wbs_ord_sorted = sorted(wbs_ord_map.values(), key=lambda x: x['ordered'], reverse=True)

    # Plant budget utilization
    plant_util = []
    for pd in plant_sorted[:8]:
        pl = pd['plant']
        wbs_in_plant = set(r.get('WBS Element') for r in filtered if str(r.get('Plant', '')) == pl and r.get('WBS Element'))
        bud = sum(budgets.get(w, 0) for w in wbs_in_plant)
        pct = min(100, round(pd['ordered'] / bud * 100)) if bud > 0 else 0
        plant_util.append({"plant": pl, "ordered": pd['ordered'], "budget": bud, "utilization": pct})

    # WBS table (top 25)
    wbs_table = []
    for entry in wbs_ord_sorted[:25]:
        w = entry['wbs']
        # Find description from rows
        desc = ''
        proj_label = ''
        for r in filtered:
            if r.get('WBS Element') == w:
                desc = r.get('WBS Description', '')
                proj_label = r.get('Project/Non-Project', '')
                break
        bud = budgets.get(w, 0)
        # Still to invoice
        still_inv = sum((r.get('Still to Invoice', 0) or 0) for r in filtered if r.get('WBS Element') == w)
        wbs_table.append({
            "type": proj_label, "wbs": w, "description": desc,
            "budget": bud, "ordered": entry['ordered'],
            "delivered": entry['delivered'], "invoiced": sum((r.get('Invoiced with GST', 0) or 0) for r in filtered if r.get('WBS Element') == w),
            "still_to_deliver": entry['still_to_deliver'], "still_to_invoice": still_inv
        })

    return {
        "kpi": {
            "wbs_count": len(wbs_all), "wbs_proj": len(wbs_proj), "wbs_non": len(wbs_non),
            "budget": bud_all, "budget_proj": bud_proj, "budget_non": bud_non,
            "po_count": len(po_all),
            "po_proj": len(set(str(r.get('Purchasing Document', '')) for r in proj_rows if r.get('Purchasing Document'))),
            "po_non": len(set(str(r.get('Purchasing Document', '')) for r in non_rows if r.get('Purchasing Document'))),
            "total": tot, "proj": tp, "non_proj": tn
        },
        "row_count": len(filtered),
        "proj_count": len(proj_rows),
        "non_count": len(non_rows),
        "monthly_trend": monthly_sorted,
        "plant_data": plant_sorted,
        "wbs_budget_top": wbs_bud_list[:10],
        "yearly_data": yearly_sorted,
        "wbs_ordered_top": wbs_ord_sorted[:10],
        "plant_utilization": plant_util,
        "wbs_table": wbs_table
    }


@api_router.get("/filters")
async def get_filters():
    rows, budgets = read_zalr_excel()
    plant_codes = sorted(set(str(r.get('Plant', '')) for r in rows if r.get('Plant')))
    plants_with_names = []
    for p in plant_codes:
        name = PLANT_NAMES.get(p, '')
        label = f"{p} — {name}" if name else p
        plants_with_names.append({"value": p, "label": label})

    wbs_list = sorted(set(r.get('WBS Element', '') for r in rows if r.get('WBS Element')))
    wbs_with_desc = []
    desc_map = {}
    for r in rows:
        w = r.get('WBS Element', '')
        if w and w not in desc_map:
            desc_map[w] = r.get('WBS Description', '')
    for w in wbs_list:
        wbs_with_desc.append({"value": w, "label": f"{w} — {(desc_map.get(w, '') or '')[:30]}"})

    pos = sorted(set(str(r.get('Purchasing Document', '')) for r in rows if r.get('Purchasing Document')))[:600]
    years = sorted(set(str(int(r.get('Year'))) for r in rows if r.get('Year') is not None))

    return {
        "plants": plants_with_names,
        "wbs_elements": wbs_with_desc,
        "purchasing_documents": pos,
        "years": years
    }


@api_router.get("/stats")
async def get_stats():
    rows, budgets = read_zalr_excel()
    total_budget = sum(budgets.values())
    wbs_count = len(set(r.get('WBS Element', '') for r in rows if r.get('WBS Element')))
    po_count = len(set(str(r.get('Purchasing Document', '')) for r in rows if r.get('Purchasing Document')))
    plant_count = len(set(str(r.get('Plant', '')) for r in rows if r.get('Plant')))

    return {
        "wbs_elements": wbs_count,
        "purchase_orders": po_count,
        "total_budget": total_budget,
        "plants": plant_count,
        "report_modules": 8,
        "total_rows": len(rows)
    }


@api_router.get("/modules")
async def get_modules():
    return [
        {"id": "zalr", "title": "ZALR Cost Dashboard", "description": "Procurement analytics with Budget, Ordered, Delivered, Invoiced and Still to Deliver with GST. Full plant-wise and WBS-wise breakdown.", "icon": "wallet", "status": "live"},
        {"id": "project-progress", "title": "Project Progress Report", "description": "Track milestone completion, schedule variance, and project health across all active developments.", "icon": "bar-chart-3", "status": "coming_soon"},
        {"id": "vendor", "title": "Vendor Performance", "description": "Supplier scorecard with delivery timelines, quality metrics, and spend analysis.", "icon": "factory", "status": "coming_soon"},
        {"id": "budget-variance", "title": "Budget Variance Report", "description": "Actuals vs budget comparison with variance flags, trend analysis, and departmental drill-down.", "icon": "trending-up", "status": "coming_soon"},
        {"id": "hr", "title": "HR Analytics", "description": "Headcount, payroll cost tracking, departmental staffing levels, and workforce distribution.", "icon": "users", "status": "coming_soon"},
        {"id": "sales", "title": "Sales Dashboard", "description": "Unit booking status, collection tracking, payment summary, ageing report, and project-wise sales velocity.", "icon": "building-2", "status": "live"},
        {"id": "cases", "title": "Case Management", "description": "Ticket status tracking, case origin analysis, owner workload, area/sub-area breakdown, TAT monitoring, and detailed case records.", "icon": "search", "status": "live"},
        {"id": "finance", "title": "Finance MIS Report", "description": "Receivables, payables, cash flow projections, and consolidated P&L tracking.", "icon": "receipt", "status": "coming_soon"},
        {"id": "audit", "title": "Audit & Compliance", "description": "Document audit trails, compliance checklists, and regulatory flags.", "icon": "search", "status": "coming_soon"},
    ]


@api_router.post("/upload")
async def upload_excel(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Only .xlsx, .xls, .csv files are accepted")

    if ZALR_FILE.exists():
        backup = DATA_DIR / 'ZALR_backup.xlsx'
        shutil.copy2(ZALR_FILE, backup)

    contents = await file.read()
    temp_path = DATA_DIR / 'temp_upload.xlsx'
    with open(temp_path, 'wb') as f:
        f.write(contents)

    try:
        wb = openpyxl.load_workbook(temp_path, read_only=True)
        sheet_names = wb.sheetnames
        first_sheet = wb[sheet_names[0]]
        headers = [cell.value for cell in next(first_sheet.iter_rows(min_row=1, max_row=1))]
        # Accept either old format (WBS Element, Plant) or new format (WBS, Plant_WBS)
        has_old = 'WBS Element' in headers and 'Plant' in headers
        has_new = 'WBS' in headers
        if not has_old and not has_new:
            wb.close()
            temp_path.unlink()
            raise HTTPException(status_code=400, detail="Missing required columns: need 'WBS' or 'WBS Element'")
        wb.close()
    except HTTPException:
        raise
    except Exception as e:
        if temp_path.exists():
            temp_path.unlink()
        raise HTTPException(status_code=400, detail=f"Invalid Excel file: {str(e)}")

    shutil.move(str(temp_path), str(ZALR_FILE))
    # Invalidate cache
    _zalr_cache["rows"] = None
    _zalr_cache["mtime"] = 0

    rows, budgets = read_zalr_excel()
    return {"message": "File uploaded successfully", "rows_count": len(rows)}


@api_router.get("/download")
async def download_current():
    from fastapi.responses import FileResponse
    ensure_seed_data()
    return FileResponse(
        str(ZALR_FILE),
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename='ZALR.xlsx'
    )


from sales_api import sales_router
from case_api import case_router
app.include_router(api_router)
app.include_router(sales_router)
app.include_router(case_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    ensure_seed_data()
    from sales_api import ensure_sales_data
    ensure_sales_data()
    logger.info("SmartWorld Analytics API started")
