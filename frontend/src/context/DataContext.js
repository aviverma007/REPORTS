import { createContext, useContext, useState, useEffect } from "react";
import * as XLSX from "xlsx";

const DataContext = createContext(null);

// ---- Excel file path (update this to match your file location in /public) ----
const EXCEL_FILE = process.env.PUBLIC_URL + "/data/ZALR.xlsx";

function safeNum(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    if (v.trim().startsWith("=")) return 0;
    const n = parseFloat(v.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function parseRows(sheet) {
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });
  return raw.map((d) => {
    // Parse date
    let yr = null, mo = null;
    const docDate = d["Document Date"];
    if (docDate) {
      const dt = new Date(docDate);
      if (!isNaN(dt)) { yr = dt.getFullYear(); mo = dt.getMonth() + 1; }
    }
    return {
      wbs:       String(d["WBS"] || ""),
      desc:      String(d["WBS Description"] || ""),
      plant:     String(d["Plant"] || ""),
      plantName: String(d["Plant Name"] || ""),
      budget:    safeNum(d["Budget"]),
      actual:    safeNum(d["Actual"]),
      po:        String(d["Purchasing Document"] || ""),
      type:      String(d["PROJECT/NON-PROJECT"] || ""),
      workType:  String(d["WORK TYPE"] || "").trim(),
      vendor:    String(d["Vendor Name"] || ""),
      shortText: String(d["Short Text"] || ""),
      docType:   String(d["Document Type"] || ""),
      yr, mo,
      ordGst:   safeNum(d["Ordered with GST"]),
      delGst:   safeNum(d["Delivered with GST"]),
      invGst:   safeNum(d["Invoiced with GST"]),
      stdGst:   safeNum(d["Still to be Delivered with GST"]),
      stiGst:   safeNum(d["Still to be Invoiced with GST"]),
      currency: String(d["Currency"] || "INR"),
    };
  });
}

function buildData(rows) {
  const proj   = rows.filter(r => r.type.toLowerCase().includes("project") && !r.type.toLowerCase().includes("non"));
  const nonproj = rows.filter(r => r.type.toLowerCase().includes("non"));

  // WBS budgets (max per WBS)
  const budgets = {};
  rows.forEach(r => {
    if (r.wbs && r.budget > (budgets[r.wbs] || 0)) budgets[r.wbs] = r.budget;
  });

  const uniqueWbs  = [...new Set(rows.map(r => r.wbs).filter(Boolean))];
  const projWbs    = [...new Set(proj.map(r => r.wbs).filter(Boolean))];
  const nonprojWbs = [...new Set(nonproj.map(r => r.wbs).filter(Boolean))];

  const sum = (arr, key) => arr.reduce((a, r) => a + (r[key] || 0), 0);

  const kpi = {
    wbsCount:    uniqueWbs.length,
    wbsProj:     projWbs.length,
    wbsNon:      nonprojWbs.length,
    budget:      uniqueWbs.reduce((a, w) => a + (budgets[w] || 0), 0),
    budgetProj:  projWbs.reduce((a, w) => a + (budgets[w] || 0), 0),
    budgetNon:   nonprojWbs.reduce((a, w) => a + (budgets[w] || 0), 0),
    poCount:     new Set(rows.map(r => r.po).filter(Boolean)).size,
    poProj:      new Set(proj.map(r => r.po).filter(Boolean)).size,
    poNon:       new Set(nonproj.map(r => r.po).filter(Boolean)).size,
    ordGst:      sum(rows, "ordGst"),
    ordGstProj:  sum(proj, "ordGst"),
    ordGstNon:   sum(nonproj, "ordGst"),
    delGst:      sum(rows, "delGst"),
    delGstProj:  sum(proj, "delGst"),
    delGstNon:   sum(nonproj, "delGst"),
    invGst:      sum(rows, "invGst"),
    invGstProj:  sum(proj, "invGst"),
    invGstNon:   sum(nonproj, "invGst"),
    stdGst:      sum(rows, "stdGst"),
    stdGstProj:  sum(proj, "stdGst"),
    stdGstNon:   sum(nonproj, "stdGst"),
    stiGst:      sum(rows, "stiGst"),
    stiGstProj:  sum(proj, "stiGst"),
    stiGstNon:   sum(nonproj, "stiGst"),
  };

  // Monthly trend
  const monthly = {};
  rows.forEach(r => {
    if (!r.yr || !r.mo) return;
    const key = `${r.yr}-${String(r.mo).padStart(2,"0")}`;
    if (!monthly[key]) monthly[key] = { month: key, ordProj:0, delProj:0, ordNon:0, delNon:0 };
    const isProj = !r.type.toLowerCase().includes("non");
    if (isProj) { monthly[key].ordProj += r.ordGst; monthly[key].delProj += r.delGst; }
    else        { monthly[key].ordNon  += r.ordGst; monthly[key].delNon  += r.delGst; }
  });
  const monthlyArr = Object.values(monthly).sort((a,b) => a.month.localeCompare(b.month));

  // Plant data
  const plantMap = {};
  rows.forEach(r => {
    if (!r.plant) return;
    if (!plantMap[r.plant]) plantMap[r.plant] = { plant: r.plant, plantName: r.plantName, ordered:0, delivered:0, stillDeliver:0 };
    plantMap[r.plant].ordered      += r.ordGst;
    plantMap[r.plant].delivered    += r.delGst;
    plantMap[r.plant].stillDeliver += r.stdGst;
  });
  const plantArr = Object.values(plantMap).sort((a,b) => b.ordered - a.ordered);

  // WBS budget top 10
  const wbsBudget = uniqueWbs
    .filter(w => budgets[w] > 0)
    .map(w => ({ wbs: w, budget: budgets[w], isProject: w.startsWith("RE/") }))
    .sort((a,b) => b.budget - a.budget)
    .slice(0, 10);

  // Yearly stacked
  const yearMap = {};
  rows.forEach(r => {
    if (!r.yr) return;
    const y = String(r.yr);
    if (!yearMap[y]) yearMap[y] = { year: y, ordered:0, delivered:0, invoiced:0, stillDeliver:0 };
    yearMap[y].ordered      += r.ordGst;
    yearMap[y].delivered    += r.delGst;
    yearMap[y].invoiced     += r.invGst;
    yearMap[y].stillDeliver += r.stdGst;
  });
  const yearlyArr = Object.values(yearMap).sort((a,b) => a.year.localeCompare(b.year));

  // WBS utilisation
  const wbsOrdMap = {};
  rows.forEach(r => {
    if (!r.wbs) return;
    if (!wbsOrdMap[r.wbs]) wbsOrdMap[r.wbs] = { wbs: r.wbs, desc: r.desc, ordered:0, delivered:0, stillDeliver:0, isProject: !r.type.toLowerCase().includes("non") };
    wbsOrdMap[r.wbs].ordered      += r.ordGst;
    wbsOrdMap[r.wbs].delivered    += r.delGst;
    wbsOrdMap[r.wbs].stillDeliver += r.stdGst;
  });
  const wbsTable = Object.values(wbsOrdMap)
    .sort((a,b) => b.ordered - a.ordered)
    .slice(0, 25)
    .map(w => ({ ...w, budget: budgets[w.wbs] || 0 }));

  // Filters
  const plants    = [...new Set(rows.map(r => r.plant).filter(Boolean))].sort();
  const years     = [...new Set(rows.map(r => r.yr).filter(Boolean))].sort();
  const workTypes = [...new Set(rows.map(r => r.workType).filter(Boolean))].sort();
  const docTypes  = [...new Set(rows.map(r => r.docType).filter(Boolean))].sort();

  return { kpi, monthly: monthlyArr, plantData: plantArr, wbsBudget, yearly: yearlyArr, wbsTable, filters: { plants, years, workTypes, docTypes }, rowCount: rows.length, projCount: proj.length, nonCount: nonproj.length, budgets };
}

export function DataProvider({ children }) {
  const [data, setData]       = useState(null);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Load Excel from /public/data/ZALR.xlsx on startup
  useEffect(() => {
    fetch(EXCEL_FILE)
      .then(res => {
        if (!res.ok) throw new Error("Excel file not found at /public/data/ZALR.xlsx");
        return res.arrayBuffer();
      })
      .then(buf => {
        const wb = XLSX.read(buf, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = parseRows(ws);
        setAllRows(rows);
        setData(buildData(rows));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filter function — called by Dashboard
  const filter = ({ type, plant, year, workType, docType }) => {
    let filtered = allRows;
    if (type === "re")  filtered = filtered.filter(r => !r.type.toLowerCase().includes("non") && r.type.toLowerCase().includes("project"));
    if (type === "ho")  filtered = filtered.filter(r => r.type.toLowerCase().includes("non"));
    if (plant)    filtered = filtered.filter(r => r.plant === plant);
    if (year)     filtered = filtered.filter(r => String(r.yr) === String(year));
    if (workType) filtered = filtered.filter(r => r.workType === workType);
    if (docType)  filtered = filtered.filter(r => r.docType === docType);
    return buildData(filtered);
  };

  return (
    <DataContext.Provider value={{ data, loading, error, filter, allRows }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
