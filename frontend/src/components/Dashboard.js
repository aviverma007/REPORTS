import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { adaptKPI, adaptMonthly, adaptPlant, adaptWbsBudget, adaptYearly, adaptWbsTable } from "@/context/adaptData";
import KPIRow from "./dashboard/KPIRow";
import ProjectCompare from "./dashboard/ProjectCompare";
import PendingDonut from "./dashboard/PendingDonut";
import MonthlyTrend from "./dashboard/MonthlyTrend";
import PlantBar from "./dashboard/PlantBar";
import WBSPie from "./dashboard/WBSPie";
import YearlyStacked from "./dashboard/YearlyStacked";
import WBSBar from "./dashboard/WBSBar";
import WBSTable from "./dashboard/WBSTable";
import { ArrowLeft, RefreshCw, Building, Layers, FileText, Calendar } from "lucide-react";

export default function Dashboard() {
  const nav = useNavigate();
  const { data: baseData, loading, error, filter } = useData();

  const [projType, setProjType] = useState("all");
  const [plant,    setPlant]    = useState("");
  const [year,     setYear]     = useState("");
  const [workType, setWorkType] = useState("");
  const [docType,  setDocType]  = useState("");

  const data = useMemo(() => {
    if (!baseData) return null;
    const t = projType === "all" ? "" : projType;
    return filter({ type: t, plant, year, workType, docType });
  }, [baseData, projType, plant, year, workType, docType, filter]);

  const resetFilters = () => {
    setProjType("all"); setPlant(""); setYear(""); setWorkType(""); setDocType("");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef1f8]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-sm font-semibold text-slate-600">Loading Excel data...</div>
        <div className="text-xs text-slate-400 mt-1">Reading ZALR.xlsx</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef1f8]">
      <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md text-center shadow-lg">
        <div className="text-4xl mb-3">⚠️</div>
        <div className="text-lg font-bold text-red-600 mb-2">Excel Not Found</div>
        <div className="text-sm text-slate-500 mb-4">{error}</div>
        <div className="text-xs bg-slate-50 border rounded-lg p-3 text-left font-mono text-slate-600">
          Place your Excel at:<br/><strong>frontend/public/data/ZALR.xlsx</strong>
        </div>
        <button onClick={() => nav("/")} className="mt-4 px-5 py-2 bg-slate-900 text-white text-xs rounded-lg">← Back</button>
      </div>
    </div>
  );

  if (!data) return null;

  // Adapt data shape for existing chart components
  const kpi       = adaptKPI(data.kpi);
  const monthly   = adaptMonthly(data.monthly);
  const plantData = adaptPlant(data.plantData);
  const wbsBudget = adaptWbsBudget(data.wbsBudget);
  const yearly    = adaptYearly(data.yearly);
  const wbsTable  = adaptWbsTable(data.wbsTable);
  const { filters, rowCount, projCount, nonCount } = data;

  return (
    <div className="min-h-screen bg-[#eef1f8] flex flex-col" data-testid="dashboard-page">

      {/* Top Nav */}
      <div className="h-14 bg-gradient-to-r from-[#0d1b3e] via-[#162553] to-[#1e3370] flex items-center px-6 gap-4 sticky top-0 z-50 shadow-lg">
        <button onClick={() => nav("/")} className="flex items-center gap-2 text-white/70 hover:text-white text-xs font-semibold border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all">
          <ArrowLeft className="w-3.5 h-3.5"/> Back to Portal
        </button>
        <div>
          <div className="text-white font-bold text-sm">ZALR Cost Dashboard</div>
          <div className="text-white/40 text-[10px]">SmartWorld Developers Analytics Suite</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-white/50 text-[11px] bg-white/8 border border-white/15 px-3 py-1 rounded-full">
            {rowCount?.toLocaleString()} Records
          </span>
          <button onClick={resetFilters} className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all">
            <RefreshCw className="w-3 h-3"/> Reset
          </button>
        </div>
      </div>

      {/* Sub bar */}
      <div className="bg-[#162553] flex items-center px-6 gap-3 h-11">
        <div className="text-white font-extrabold text-sm tracking-widest uppercase">Cost Dashboard</div>
        <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40">● PROJECT (RE/)</span>
        <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-400/40">● NON-PROJECT (HO/)</span>
        <span className="ml-auto text-white/40 text-[11px]">
          {new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
        </span>
      </div>

      <div className="flex flex-1" data-testid="dashboard-sidebar">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-slate-200 flex-shrink-0 sticky top-[92px] h-[calc(100vh-92px)] overflow-y-auto">
          <div className="p-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md mb-2">Z</div>
            <div className="text-sm font-bold text-slate-800">ZALR Dashboard</div>
            <div className="text-[9px] text-slate-400 tracking-widest uppercase font-semibold">Cost Analytics</div>
          </div>

          <div className="p-3 border-b border-slate-100">
            <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-2">Project Type</div>
            <div className="flex gap-1.5">
              {[["all","ALL"],["re","PROJECT"],["ho","NON-PROJ"]].map(([v,l])=>(
                <button key={v} onClick={()=>setProjType(v)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    projType===v
                      ? v==="all" ? "bg-slate-900 text-white border-slate-900"
                      : v==="re"  ? "bg-blue-50 text-blue-800 border-blue-400"
                      :              "bg-green-50 text-green-800 border-green-400"
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}>{l}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 space-y-2.5">
            <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Filters</div>
            {[
              ["Plant",     plant,    setPlant,    filters.plants.map(p=>p),    Building],
              ["Year",      year,     setYear,     filters.years.map(y=>String(y)), Calendar],
              ["Work Type", workType, setWorkType, filters.workTypes,            Layers],
              ["Doc Type",  docType,  setDocType,  filters.docTypes,             FileText],
            ].map(([label,val,setter,opts,Icon])=>(
              <div key={label}>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Icon className="w-2.5 h-2.5"/>{label}
                </div>
                <select value={val} onChange={e=>setter(e.target.value)}
                  className="w-full text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-400">
                  <option value="">All {label}s</option>
                  {opts.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <button onClick={resetFilters}
              className="w-full py-2 rounded-lg border border-amber-400 bg-amber-50 text-amber-700 text-[11px] font-bold hover:bg-amber-100 transition-colors">
              ↺ Reset All Filters
            </button>
          </div>

          <div className="p-3 border-t border-slate-100">
            <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-2">Summary</div>
            {[["Filtered Rows",rowCount?.toLocaleString()],["Unique WBS",kpi.wbs_count],["Unique POs",kpi.po_count?.toLocaleString()],["Project Rows",projCount?.toLocaleString()],["Non-Project",nonCount?.toLocaleString()]].map(([k,v])=>(
              <div key={k} className="flex justify-between py-1.5 text-[11px] border-b border-slate-50 last:border-none">
                <span className="text-slate-500">{k}</span>
                <span className="font-bold text-amber-600 font-mono">{v}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-5 min-w-0 space-y-4">
          <KPIRow kpi={kpi}/>

          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div><p className="font-bold text-slate-800 text-sm">PROJECT vs NON-PROJECT Breakdown</p><p className="text-[11px] text-slate-400">Key metrics split by project type</p></div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">COMPARISON</span>
              </div>
              <ProjectCompare kpi={kpi}/>
            </div>
            <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div><p className="font-bold text-slate-800 text-sm">Still to Deliver vs Invoice</p><p className="text-[11px] text-slate-400">Pending commitment breakdown</p></div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">DONUT</span>
              </div>
              <PendingDonut kpi={kpi}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div><p className="font-bold text-slate-800 text-sm">Month-wise Ordered vs Delivered (GST)</p><p className="text-[11px] text-slate-400">Trend by Document Date</p></div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">LINE</span>
              </div>
              <MonthlyTrend data={monthly}/>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div><p className="font-bold text-slate-800 text-sm">Plant-wise Ordered vs Delivered</p><p className="text-[11px] text-slate-400">GST values per plant</p></div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">BAR</span>
              </div>
              <PlantBar data={plantData}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div><p className="font-bold text-slate-800 text-sm">Top WBS Budget Allocation</p><p className="text-[11px] text-slate-400">Budget distribution by WBS</p></div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">PIE</span>
              </div>
              <WBSPie data={wbsBudget}/>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div><p className="font-bold text-slate-800 text-sm">Year-wise Cumulative Values</p><p className="text-[11px] text-slate-400">Ordered · Delivered · Invoiced</p></div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">STACKED</span>
              </div>
              <YearlyStacked data={yearly}/>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div><p className="font-bold text-slate-800 text-sm">WBS Budget Utilisation — Top 12</p><p className="text-[11px] text-slate-400">Spend as % of budget per WBS</p></div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">PROGRESS</span>
            </div>
            <WBSBar data={wbsTable} budgets={wbsBudget}/>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div><p className="font-bold text-slate-800 text-sm">WBS Detail Table — Top 25</p><p className="text-[11px] text-slate-400">Ordered, Delivered, Invoiced, Still to Deliver</p></div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">TABLE</span>
            </div>
            <WBSTable data={wbsTable}/>
          </div>
        </div>
      </div>

      <div className="bg-[#0d1b3e] px-6 py-2 flex items-center gap-5">
        <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_#4ade80] animate-pulse"></div>Live Data
        </div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider">SmartWorld BI · ZALR Procurement</div>
        <div className="ml-auto text-[10px] text-white/30">{new Date().toLocaleTimeString("en-GB",{hour12:false})}</div>
      </div>
    </div>
  );
}
