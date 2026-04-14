"""Generate seed ZALR Excel file from embedded data"""
import json
import openpyxl
from pathlib import Path

DATA_DIR = Path(__file__).parent / 'data'
DATA_DIR.mkdir(exist_ok=True)

def generate_seed_excel():
    filepath = DATA_DIR / 'ZALR.xlsx'
    if filepath.exists():
        return str(filepath)
    
    with open(Path(__file__).parent / 'raw_seed.json', 'r') as f:
        raw = json.load(f)
    
    P = raw['P']  # Plant codes
    W = raw['W']  # WBS element names
    D = raw['D']  # WBS descriptions
    B = raw['B']  # Budgets per WBS index
    R = raw['R']  # Rows: [plantIdx, wbsIdx, PO, projType, year, month, ord, del, inv, stInv, stDel]
    
    wb = openpyxl.Workbook()
    
    # Sheet 1: ZALR Data (main rows)
    ws = wb.active
    ws.title = 'ZALR_Data'
    headers = [
        'Plant', 'WBS Element', 'WBS Description', 'Purchasing Document',
        'Project/Non-Project', 'Year', 'Month',
        'Ordered with GST', 'Delivered with GST', 'Invoiced with GST',
        'Still to Invoice', 'Still to Deliver GST'
    ]
    ws.append(headers)
    
    for row in R:
        plant_idx, wbs_idx, po, proj_type, year, month = row[0], row[1], row[2], row[3], row[4], row[5]
        ordered, delivered, invoiced, still_inv, still_del = row[6], row[7], row[8], row[9], row[10]
        
        ws.append([
            P[plant_idx],
            W[wbs_idx],
            D[wbs_idx],
            po,
            'Project' if proj_type == 0 else 'Non-Project',
            year,
            month,
            ordered,
            delivered,
            invoiced,
            still_inv,
            still_del
        ])
    
    # Sheet 2: WBS Budget Reference
    ws2 = wb.create_sheet('WBS_Budget')
    ws2.append(['WBS Element', 'WBS Description', 'Budget'])
    for i in range(len(W)):
        ws2.append([W[i], D[i], B[i]])
    
    wb.save(filepath)
    print(f"Seed Excel saved to {filepath} with {len(R)} rows")
    return str(filepath)

if __name__ == '__main__':
    generate_seed_excel()
