import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, Upload, LayoutGrid, RefreshCw, Building, Layers, FileText, Calendar, CalendarDays
} from "lucide-react";
import KPIRow from "./dashboard/KPIRow";
import ProjectCompare from "./dashboard/ProjectCompare";
import PendingDonut from "./dashboard/PendingDonut";
import MonthlyTrend from "./dashboard/MonthlyTrend";
import PlantBar from "./dashboard/PlantBar";
import WBSPie from "./dashboard/WBSPie";
import YearlyStacked from "./dashboard/YearlyStacked";
import WBSBar from "./dashboard/WBSBar";
import PlantGauge from "./dashboard/PlantGauge";
import WBSTable from "./dashboard/WBSTable";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter state — arrays for multi-select
  const [plant, setPlant] = useState([]);
  const [wbs, setWbs] = useState([]);
  const [po, setPo] = useState([]);
  const [projType, setProjType] = useState("");
  const [year, setYear] = useState([]);
  const [month, setMonth] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (plant.length) params.plant = plant.join(',');
      if (wbs.length) params.wbs = wbs.join(',');
      if (po.length) params.po = po.join(',');
      if (projType) params.proj_type = projType;
      if (year.length) params.year = year.join(',');
      if (month.length) params.month = month.join(',');
      const res = await axios.get(`${API}/data`, { params });
      setData(res.data);
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const res = await axios.get(`${API}/filters`);
      setFilters(res.data);
    } catch (e) {
      console.error("Failed to fetch filters", e);
    }
  };

  useEffect(() => { fetchFilters(); }, []);
  useEffect(() => { fetchData(); }, [plant, wbs, po, projType, year, month]); // eslint-disable-line

  const resetFilters = () => {
    setPlant([]); setWbs([]); setPo([]); setProjType(""); setYear([]); setMonth([]);
  };

  const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex" data-testid="dashboard-page">
      {/* Sidebar */}
      <aside className="w-60 border-r border-zinc-200 bg-white flex-shrink-0 flex flex-col sticky top-0 h-screen overflow-y-auto" data-testid="dashboard-sidebar">
        <div className="p-4 border-b border-zinc-200">
          <div className="w-9 h-9 bg-zinc-950 text-white flex items-center justify-center text-base font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Z</div>
          <div className="text-sm font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>ZALR Dashboard</div>
          <div className="text-[9px] text-zinc-400 tracking-[0.14em] uppercase">Cost Analytics</div>
        </div>

        {/* Project Type Toggle */}
        <div className="px-3 pt-4">
          <div className="text-[8px] font-bold tracking-[0.18em] uppercase text-zinc-400 mb-2 px-1">Project Type</div>
          <div className="flex gap-1">
            {[
              { val: "", label: "ALL", cls: "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200" },
              { val: "Project", label: "PROJECT", cls: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" },
              { val: "Non-Project", label: "NON-PROJ", cls: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" }
            ].map(btn => (
              <button
                key={btn.val}
                data-testid={`filter-proj-${btn.val || 'all'}`}
                className={`flex-1 py-1.5 text-[9px] font-bold tracking-[0.05em] uppercase border transition-all ${
                  projType === btn.val ? "ring-1 ring-zinc-950 ring-offset-1" : ""
                } ${btn.cls}`}
                onClick={() => setProjType(btn.val)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="px-3 pt-4 flex-1">
          <div className="text-[8px] font-bold tracking-[0.18em] uppercase text-zinc-400 mb-3 px-1">Filters</div>

          <MultiSelect icon={Building} label="Plant" selected={plant} onChange={setPlant} testId="filter-plant"
            options={(filters?.plants || []).map(p => ({ value: p.value, label: p.label }))} />

          <MultiSelect icon={Layers} label="WBS Element" selected={wbs} onChange={setWbs} testId="filter-wbs"
            options={(filters?.wbs_elements || []).map(w => ({ value: w.value, label: w.label }))} />

          <MultiSelect icon={FileText} label="Purchasing Document" selected={po} onChange={setPo} testId="filter-po"
            options={(filters?.purchasing_documents || []).map(p => ({ value: p, label: p }))} />

          <MultiSelect icon={Calendar} label="Year" selected={year} onChange={setYear} testId="filter-year"
            options={(filters?.years || []).map(y => ({ value: y, label: y }))} />

          <MultiSelect icon={CalendarDays} label="Month" selected={month} onChange={setMonth} testId="filter-month"
            options={MONTHS.slice(1).map((m, i) => ({ value: String(i + 1), label: m }))} />

          <button
            data-testid="filter-reset-btn"
            className="w-full mt-3 py-2 text-[10px] font-semibold tracking-[0.08em] uppercase border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-colors flex items-center justify-center gap-2"
            onClick={resetFilters}
          >
            <RefreshCw className="w-3 h-3" /> Reset All Filters
          </button>
        </div>

        {/* Sidebar Stats */}
        {data && (
          <div className="mx-3 mb-3 p-3 bg-zinc-50 border border-zinc-200 text-[10px]" data-testid="sidebar-stats">
            {[
              { label: "Filtered Rows", val: data.row_count?.toLocaleString() },
              { label: "Unique WBS", val: data.kpi?.wbs_count },
              { label: "Unique POs", val: data.kpi?.po_count },
              { label: "Project Rows", val: data.proj_count?.toLocaleString() },
              { label: "Non-Project Rows", val: data.non_count?.toLocaleString() },
            ].map(s => (
              <div key={s.label} className="flex justify-between py-1">
                <span className="text-zinc-400">{s.label}</span>
                <span className="font-bold text-zinc-700">{s.val}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 flex-shrink-0 border-b border-zinc-200 bg-white flex items-center justify-between px-5 sticky top-0 z-30" data-testid="dashboard-header">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-base font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>COST DASHBOARD</div>
              <div className="text-[10px] text-zinc-400 tracking-wide">ZALR — Procurement & Budget Analytics</div>
            </div>
            <div className="flex gap-2 ml-4">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> PROJECT (RE/)
              </span>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> NON-PROJECT (HO/)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 bg-zinc-100 border border-zinc-200 text-zinc-500" data-testid="header-record-count">
              {data?.row_count?.toLocaleString() || '—'} records
            </span>
            <button data-testid="header-upload-btn" className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors tracking-wide uppercase font-medium px-3 py-1.5 border border-zinc-200 hover:border-zinc-400" onClick={() => nav("/upload")}>
              <Upload className="w-3.5 h-3.5" /> Update Excel
            </button>
            <button data-testid="header-back-btn" className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors tracking-wide uppercase font-medium px-3 py-1.5 border border-zinc-200 hover:border-zinc-400" onClick={() => nav("/")}>
              <ArrowLeft className="w-3.5 h-3.5" /> Portal
            </button>
          </div>
        </header>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" data-testid="dashboard-canvas">
          {loading ? (
            <div className="flex-1 flex items-center justify-center" data-testid="dashboard-loader">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin mx-auto mb-3"></div>
                <div className="text-xs text-zinc-400">Loading dashboard...</div>
              </div>
            </div>
          ) : data ? (
            <>
              <KPIRow kpi={data.kpi} />
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3"><ProjectCompare kpi={data.kpi} /></div>
                <div className="lg:col-span-2"><PendingDonut kpi={data.kpi} /></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <MonthlyTrend data={data.monthly_trend} />
                <PlantBar data={data.plant_data} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <WBSPie data={data.wbs_budget_top} />
                <YearlyStacked data={data.yearly_data} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3"><WBSBar data={data.wbs_ordered_top} budgets={data.wbs_budget_top} /></div>
                <div className="lg:col-span-2"><PlantGauge data={data.plant_utilization} /></div>
              </div>
              <WBSTable data={data.wbs_table} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MultiSelect({ icon: Icon, label, selected, onChange, options, testId }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter(v => v !== val));
    else onChange([...selected, val]);
  };

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="mb-3 relative">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3 h-3 text-zinc-400" />
        <span className="text-[9px] font-semibold tracking-[0.1em] uppercase text-zinc-400">{label}</span>
      </div>
      <button
        data-testid={testId}
        onClick={() => setOpen(p => !p)}
        className="w-full bg-zinc-50 border border-zinc-200 py-1.5 px-2 text-xs text-zinc-700 text-left transition-colors hover:border-zinc-400 flex items-center justify-between"
      >
        <span className="truncate">
          {selected.length === 0
            ? `All ${label}`
            : selected.length === 1
              ? (options.find(o => o.value === selected[0])?.label || selected[0])
              : `${selected.length} selected`}
        </span>
        <svg className={`w-3 h-3 text-zinc-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 9 5"><path d="M0 0l4.5 5L9 0z" fill="currentColor" /></svg>
      </button>
      {selected.length > 0 && (
        <button
          className="absolute top-0 right-0 text-[8px] text-blue-500 hover:underline"
          onClick={() => onChange([])}
        >clear</button>
      )}
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => { setOpen(false); setSearch(""); }} />
          <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-zinc-200 shadow-lg max-h-56 overflow-hidden flex flex-col">
            {options.length > 8 && (
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border-b border-zinc-100 px-2 py-1.5 text-[11px] outline-none bg-zinc-50"
                autoFocus
              />
            )}
            <div className="overflow-y-auto flex-1">
              {filtered.map(o => (
                <label
                  key={o.value}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-50 cursor-pointer text-[11px] text-zinc-700"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(o.value)}
                    onChange={() => toggle(o.value)}
                    className="w-3 h-3 rounded-sm accent-blue-600"
                  />
                  <span className="truncate">{o.label}</span>
                </label>
              ))}
              {filtered.length === 0 && (
                <div className="px-2 py-2 text-[10px] text-zinc-400">No results</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
