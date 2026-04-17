import { useState, useEffect, useCallback } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import {
  TicketCheck, TicketX, Tickets, Upload, Download, Search,
  ChevronLeft, ChevronRight, Filter, X, AlertTriangle, Users, Scale,
  ArrowUpDown, RotateCcw
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8001"}/api/cases`;

const COLORS = ["#004DE6", "#16A34A", "#DC2626", "#D97706", "#8B5CF6", "#0EA5E9", "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#A855F7"];

const STATUS_COLORS = {
  "Resolved": "#16A34A", "Closed": "#0EA5E9", "Close": "#0EA5E9",
  "In Progress": "#D97706", "New": "#004DE6",
  "Pending for Clarification": "#8B5CF6", "Re-Open": "#DC2626", "Unknown": "#94A3B8"
};

function formatNum(n) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return n.toLocaleString("en-IN");
  return n;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded text-xs shadow-lg border border-slate-700">
      <p className="font-semibold mb-1">{label || payload[0]?.name}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#fff" }}>
          {p.name || p.dataKey}: {p.value?.toLocaleString("en-IN")}
          {p.payload?.pct ? ` (${p.payload.pct}%)` : ""}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded text-xs shadow-lg border border-slate-700">
      <p className="font-semibold">{payload[0]?.name}</p>
      <p>{payload[0]?.value?.toLocaleString("en-IN")}</p>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange, testId }) {
  return (
    <div className="mb-3">
      <label className="text-[10px] uppercase tracking-[0.1em] font-medium text-slate-400 mb-1 block font-ibm">{label}</label>
      <select
        data-testid={testId}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white border border-slate-200 rounded-sm px-2 py-1.5 text-xs text-slate-800 font-ibm focus:outline-none focus:border-[#004DE6] transition-all duration-150"
      >
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function KPICard({ label, value, icon: Icon, color, sub, testId }) {
  return (
    <div data-testid={testId} className="bg-white border border-slate-200 p-4 flex items-start gap-3 transition-all duration-150 hover:border-slate-300">
      <div className={`w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.1em] font-medium text-slate-400 font-ibm">{label}</p>
        <p className="text-2xl font-black text-slate-900 font-chivo leading-tight">{formatNum(value)}</p>
        {sub && <p className="text-[10px] text-slate-400 font-ibm mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function TogglePill({ label, active, onClick, testId }) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all duration-150 border font-ibm ${
        active
          ? "bg-white text-[#0A2540] border-white"
          : "bg-transparent text-slate-300 border-slate-500 hover:border-slate-300 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function CaseManagement() {
  const [filters, setFilters] = useState(null);
  const [data, setData] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  // Filter state
  const [f, setF] = useState({
    case_type: "", status: "", case_origin: "", area: "", sub_area: "",
    case_owner: "", hod: "", team_leader: "", project: "", priority: "",
    case_applicability: "", response_time: "", resolution_time: "",
  });

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v) params.set(k, v); });
    return params.toString();
  }, [f]);

  useEffect(() => {
    fetch(`${API}/filters`).then(r => r.json()).then(setFilters);
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = buildQuery();
    fetch(`${API}/data?${q}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [f, buildQuery]);

  useEffect(() => {
    setTableLoading(true);
    const q = buildQuery();
    const extra = `&page=${page}&page_size=50${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    fetch(`${API}/table?${q}${extra}`)
      .then(r => r.json())
      .then(d => { setTableData(d); setTableLoading(false); });
  }, [f, page, search, buildQuery]);

  const resetFilters = () => {
    setF({
      case_type: "", status: "", case_origin: "", area: "", sub_area: "",
      case_owner: "", hod: "", team_leader: "", project: "", priority: "",
      case_applicability: "", response_time: "", resolution_time: "",
    });
    setPage(1);
    setSearch("");
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${API}/upload`, { method: "POST", body: fd });
      const result = await res.json();
      if (res.ok) {
        alert(`Uploaded successfully! ${result.rows_count} rows loaded.`);
        window.location.reload();
      } else {
        alert(result.detail || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    }
    setUploading(false);
    e.target.value = "";
  };

  const kpi = data?.kpi;

  return (
    <div className="min-h-screen bg-slate-50 font-ibm">
      {/* Header */}
      <header data-testid="case-header" className="bg-[#0A2540] text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#004DE6] rounded-sm flex items-center justify-center">
              <TicketCheck size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight font-chivo leading-none">CASE MANAGEMENT</h1>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase">SmartWorld Developers</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-wrap justify-center">
            <TogglePill testId="toggle-beyond-tat" label="Beyond TAT" active={f.response_time === "Above 24 Hrs"} onClick={() => setF(p => ({ ...p, response_time: p.response_time === "Above 24 Hrs" ? "" : "Above 24 Hrs" }))} />
            <TogglePill testId="toggle-within-tat" label="Within TAT" active={f.response_time === "Within 24 Hrs"} onClick={() => setF(p => ({ ...p, response_time: p.response_time === "Within 24 Hrs" ? "" : "Within 24 Hrs" }))} />
            <div className="w-px h-5 bg-slate-600 mx-1" />
            <TogglePill testId="toggle-exclusion" label="Exclusion" active={f.case_applicability === "Exclusion"} onClick={() => setF(p => ({ ...p, case_applicability: p.case_applicability === "Exclusion" ? "" : "Exclusion" }))} />
            <TogglePill testId="toggle-inclusion" label="Inclusion" active={f.case_applicability === "Inclusion"} onClick={() => setF(p => ({ ...p, case_applicability: p.case_applicability === "Inclusion" ? "" : "Inclusion" }))} />
            <div className="w-px h-5 bg-slate-600 mx-1" />
            <TogglePill testId="toggle-above-24" label="Above 24 Hrs" active={f.resolution_time === "Above 24 Hrs"} onClick={() => setF(p => ({ ...p, resolution_time: p.resolution_time === "Above 24 Hrs" ? "" : "Above 24 Hrs" }))} />
            <TogglePill testId="toggle-within-24" label="Within 24 Hrs" active={f.resolution_time === "Within 24 Hrs"} onClick={() => setF(p => ({ ...p, resolution_time: p.resolution_time === "Within 24 Hrs" ? "" : "Within 24 Hrs" }))} />
          </div>

          <div className="flex items-center gap-2">
            <label data-testid="upload-excel-btn" className={`flex items-center gap-1.5 px-3 py-1.5 bg-[#004DE6] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-[#0033A0] transition-all duration-150 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
              <Upload size={14} />
              {uploading ? "Uploading..." : "Upload Excel"}
              <input type="file" accept=".xlsx,.xls" onChange={handleUpload} className="hidden" />
            </label>
            <a href={`${API}/download`} data-testid="download-excel-btn" className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-500 text-slate-300 text-xs font-semibold uppercase tracking-wider hover:border-white hover:text-white transition-all duration-150">
              <Download size={14} /> Download
            </a>
            <a href="/" data-testid="back-portal-btn" className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-500 text-slate-300 text-xs font-semibold uppercase tracking-wider hover:border-white hover:text-white transition-all duration-150">
              Portal
            </a>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          data-testid="case-sidebar"
          className={`${sidebarOpen ? "w-[240px]" : "w-0 overflow-hidden"} flex-shrink-0 bg-white border-r border-slate-200 transition-all duration-200 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600 font-chivo flex items-center gap-1.5">
                <Filter size={12} /> Filters
              </p>
              <button data-testid="reset-filters-btn" onClick={resetFilters} className="text-[10px] text-[#004DE6] font-semibold uppercase tracking-wider hover:underline flex items-center gap-1">
                <RotateCcw size={10} /> Reset
              </button>
            </div>
            {filters && (
              <>
                <FilterSelect testId="filter-case-type" label="Case Type" value={f.case_type} options={filters.case_types} onChange={v => { setF(p => ({ ...p, case_type: v })); setPage(1); }} />
                <FilterSelect testId="filter-status" label="Status" value={f.status} options={filters.statuses} onChange={v => { setF(p => ({ ...p, status: v })); setPage(1); }} />
                <FilterSelect testId="filter-case-origin" label="Case Origin" value={f.case_origin} options={filters.case_origins} onChange={v => { setF(p => ({ ...p, case_origin: v })); setPage(1); }} />
                <FilterSelect testId="filter-area" label="Area" value={f.area} options={filters.areas} onChange={v => { setF(p => ({ ...p, area: v })); setPage(1); }} />
                <FilterSelect testId="filter-sub-area" label="Sub Area" value={f.sub_area} options={filters.sub_areas} onChange={v => { setF(p => ({ ...p, sub_area: v })); setPage(1); }} />
                <FilterSelect testId="filter-case-owner" label="Case Owner" value={f.case_owner} options={filters.case_owners} onChange={v => { setF(p => ({ ...p, case_owner: v })); setPage(1); }} />
                <FilterSelect testId="filter-hod" label="HOD" value={f.hod} options={filters.hods} onChange={v => { setF(p => ({ ...p, hod: v })); setPage(1); }} />
                <FilterSelect testId="filter-team-leader" label="Team Leader" value={f.team_leader} options={filters.team_leaders} onChange={v => { setF(p => ({ ...p, team_leader: v })); setPage(1); }} />
                <FilterSelect testId="filter-project" label="Project" value={f.project} options={filters.projects} onChange={v => { setF(p => ({ ...p, project: v })); setPage(1); }} />
                <FilterSelect testId="filter-priority" label="Priority" value={f.priority} options={filters.priorities} onChange={v => { setF(p => ({ ...p, priority: v })); setPage(1); }} />
              </>
            )}
          </div>
        </aside>

        {/* Toggle sidebar */}
        <button
          data-testid="toggle-sidebar-btn"
          onClick={() => setSidebarOpen(p => !p)}
          className="sticky top-[52px] h-[calc(100vh-52px)] w-5 flex items-center justify-center bg-slate-100 border-r border-slate-200 hover:bg-slate-200 transition-all duration-150 z-10"
        >
          {sidebarOpen ? <ChevronLeft size={12} className="text-slate-500" /> : <ChevronRight size={12} className="text-slate-500" />}
        </button>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-5">
          {loading || !data ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {/* KPI Row */}
              <div data-testid="kpi-row" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-slate-200 border border-slate-200">
                <KPICard testId="kpi-total" label="Total Tickets" value={kpi.total} icon={Tickets} color="bg-[#0A2540]" />
                <KPICard testId="kpi-open" label="Open Tickets" value={kpi.open} icon={TicketX} color="bg-amber-500" sub={`${((kpi.open/kpi.total)*100).toFixed(1)}% of total`} />
                <KPICard testId="kpi-closed" label="Closed Tickets" value={kpi.closed} icon={TicketCheck} color="bg-emerald-600" sub={`${((kpi.closed/kpi.total)*100).toFixed(1)}% of total`} />
                <KPICard testId="kpi-escalated" label="Escalated" value={kpi.escalated} icon={AlertTriangle} color="bg-rose-600" />
                <KPICard testId="kpi-hni" label="HNI Customers" value={kpi.hni} icon={Users} color="bg-violet-600" />
                <KPICard testId="kpi-legal" label="Legal Cases" value={kpi.legal} icon={Scale} color="bg-slate-600" />
              </div>

              {/* Row 2: Case Type Pie + Status Breakdown + Case Origin */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Case Type Pie */}
                <div data-testid="case-type-chart" className="lg:col-span-3 bg-white border border-slate-200 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-chivo mb-3">Case Type</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={data.case_types} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} strokeWidth={2} stroke="#fff">
                        {data.case_types.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "IBM Plex Sans" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Status Breakdown */}
                <div data-testid="status-breakdown" className="lg:col-span-4 bg-white border border-slate-200 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-chivo mb-3">Status Breakdown</h3>
                  <div className="space-y-2">
                    {data.status_breakdown.map(s => (
                      <div key={s.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[s.name] || "#94A3B8" }} />
                        <span className="text-xs text-slate-600 font-ibm w-40 truncate">{s.name}</span>
                        <div className="flex-1 h-5 bg-slate-100 relative rounded-sm overflow-hidden">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${Math.max(1, (s.value / kpi.total) * 100)}%`,
                              backgroundColor: STATUS_COLORS[s.name] || "#94A3B8"
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-800 w-16 text-right font-chivo">{formatNum(s.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Case Origin */}
                <div data-testid="case-origin-chart" className="lg:col-span-5 bg-white border border-slate-200 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-chivo mb-3">Case Origin</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.case_origins} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fontFamily: "IBM Plex Sans", fill: "#475569" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={18}>
                        {data.case_origins.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Row 3: Case Owner + Area/Sub Area Table */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Cases by Owner */}
                <div data-testid="case-owner-chart" className="lg:col-span-5 bg-white border border-slate-200 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-chivo mb-3">Cases by Case Owner</h3>
                  <ResponsiveContainer width="100%" height={Math.max(280, data.case_owners.length * 28)}>
                    <BarChart data={data.case_owners} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fontFamily: "IBM Plex Sans", fill: "#475569" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[0, 2, 2, 0]} barSize={16}>
                        {data.case_owners.map((_, i) => <Cell key={i} fill={`hsl(${260 + i * 8}, 60%, ${55 + i * 2}%)`} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Area/Sub Area */}
                <div data-testid="area-sub-area-table" className="lg:col-span-4 bg-white border border-slate-200 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-chivo mb-3">Area / Sub Area</h3>
                  <div className="overflow-y-auto max-h-[400px]">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-[#0A2540] text-white">
                        <tr>
                          <th className="text-left px-2 py-1.5 font-semibold">Area</th>
                          <th className="text-left px-2 py-1.5 font-semibold">Sub Area</th>
                          <th className="text-right px-2 py-1.5 font-semibold">Cases</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.area_sub_area.map((r, i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-100">
                            <td className="px-2 py-1.5 text-slate-700">{r.area}</td>
                            <td className="px-2 py-1.5 text-slate-500">{r.sub_area}</td>
                            <td className="px-2 py-1.5 text-right font-bold text-slate-800 font-chivo">{r.count.toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Project + Priority breakdown */}
                <div className="lg:col-span-3 space-y-5">
                  <div data-testid="project-breakdown" className="bg-white border border-slate-200 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-chivo mb-3">By Project</h3>
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                      {data.projects.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 w-28 truncate" title={p.name}>{p.name}</span>
                          <div className="flex-1 h-3 bg-slate-100 rounded-sm overflow-hidden">
                            <div className="h-full bg-[#0EA5E9]" style={{ width: `${(p.value / (data.projects[0]?.value || 1)) * 100}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 w-12 text-right">{formatNum(p.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div data-testid="priority-breakdown" className="bg-white border border-slate-200 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-chivo mb-3">Priority</h3>
                    <ResponsiveContainer width="100%" height={130}>
                      <PieChart>
                        <Pie data={data.priorities} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={25} strokeWidth={2} stroke="#fff">
                          {data.priorities.map((_, i) => <Cell key={i} fill={["#DC2626", "#D97706", "#16A34A"][i] || COLORS[i]} />)}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "10px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Row 4: Team Leader + Response/Resolution Time */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div data-testid="team-leader-chart" className="lg:col-span-5 bg-white border border-slate-200 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-chivo mb-3">Cases by Team Leader</h3>
                  <ResponsiveContainer width="100%" height={Math.max(200, data.team_leaders.length * 28)}>
                    <BarChart data={data.team_leaders} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fontFamily: "IBM Plex Sans", fill: "#475569" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#0EA5E9" radius={[0, 2, 2, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="lg:col-span-3 bg-white border border-slate-200 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-chivo mb-3">Response Time</h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={data.response_time} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={30} strokeWidth={2} stroke="#fff">
                        {data.response_time.map((_, i) => <Cell key={i} fill={["#16A34A", "#DC2626"][i] || COLORS[i]} />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="lg:col-span-4 bg-white border border-slate-200 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-chivo mb-3">Applicability &amp; Resolution</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-ibm">Applicability</p>
                      {data.applicability.map((a, i) => (
                        <div key={i} className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-slate-600">{a.name}</span>
                          <span className="text-xs font-bold text-slate-800 font-chivo">{formatNum(a.value)}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-ibm">Resolution Time</p>
                      {data.resolution_time.map((r, i) => (
                        <div key={i} className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-slate-600">{r.name}</span>
                          <span className="text-xs font-bold text-slate-800 font-chivo">{formatNum(r.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 5: Detailed Case Table */}
              <div data-testid="case-detail-table" className="bg-white border border-slate-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-chivo flex items-center gap-2">
                    <ArrowUpDown size={12} /> Case Details
                    {tableData && <span className="text-slate-400 font-normal">({tableData.total.toLocaleString("en-IN")} records)</span>}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        data-testid="case-search-input"
                        type="text"
                        placeholder="Search case number, name..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="pl-7 pr-7 py-1.5 border border-slate-200 text-xs w-56 focus:outline-none focus:border-[#004DE6] font-ibm rounded-sm"
                      />
                      {search && (
                        <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-[#0A2540] text-white">
                      <tr>
                        {["Case #", "Account", "Owner", "HOD", "Team Leader", "Status", "Type", "Origin", "Area", "Sub Area", "Priority", "Project", "Opened", "Closed"].map(h => (
                          <th key={h} className="text-left px-2 py-2 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableLoading ? (
                        [...Array(10)].map((_, i) => (
                          <tr key={i}><td colSpan={14} className="h-8 bg-slate-50 animate-pulse" /></tr>
                        ))
                      ) : tableData?.rows?.map((r, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-100">
                          <td className="px-2 py-1.5 font-mono text-[#004DE6] font-bold">{r.case_number}</td>
                          <td className="px-2 py-1.5 text-slate-700 max-w-[120px] truncate" title={r.account_name}>{r.account_name}</td>
                          <td className="px-2 py-1.5 text-slate-600">{r.case_owner}</td>
                          <td className="px-2 py-1.5 text-slate-500">{r.hod}</td>
                          <td className="px-2 py-1.5 text-slate-500">{r.team_leader}</td>
                          <td className="px-2 py-1.5">
                            <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded-sm ${
                              r.status === "Resolved" || r.status === "Closed" || r.status === "Close" ? "bg-emerald-100 text-emerald-800" :
                              r.status === "In Progress" ? "bg-amber-100 text-amber-800" :
                              r.status === "New" ? "bg-blue-100 text-blue-800" :
                              r.status === "Re-Open" ? "bg-rose-100 text-rose-800" :
                              "bg-slate-100 text-slate-700"
                            }`}>{r.status}</span>
                          </td>
                          <td className="px-2 py-1.5 text-slate-500">{r.case_type}</td>
                          <td className="px-2 py-1.5 text-slate-500">{r.case_origin}</td>
                          <td className="px-2 py-1.5 text-slate-600">{r.area}</td>
                          <td className="px-2 py-1.5 text-slate-500">{r.sub_area}</td>
                          <td className="px-2 py-1.5">
                            <span className={`text-[10px] font-semibold ${r.priority === "High" ? "text-rose-600" : r.priority === "Low" ? "text-emerald-600" : "text-amber-600"}`}>{r.priority}</span>
                          </td>
                          <td className="px-2 py-1.5 text-slate-500 max-w-[100px] truncate" title={r.project}>{r.project}</td>
                          <td className="px-2 py-1.5 text-slate-400 whitespace-nowrap">{r.date_opened}</td>
                          <td className="px-2 py-1.5 text-slate-400 whitespace-nowrap">{r.closed_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {tableData && (
                  <div data-testid="case-pagination" className="flex items-center justify-between p-3 border-t border-slate-200">
                    <p className="text-[10px] text-slate-400 font-ibm">
                      Showing {((page - 1) * 50) + 1}-{Math.min(page * 50, tableData.total)} of {tableData.total.toLocaleString("en-IN")}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        data-testid="prev-page-btn"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="p-1 border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-all duration-150"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-xs font-bold text-slate-700 px-2 font-chivo">
                        {page} / {tableData.total_pages}
                      </span>
                      <button
                        data-testid="next-page-btn"
                        onClick={() => setPage(p => Math.min(tableData.total_pages, p + 1))}
                        disabled={page >= tableData.total_pages}
                        className="p-1 border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-all duration-150"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
