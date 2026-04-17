import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, Building, Layers, Home, CreditCard, Clock,
  Upload, Download, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react";
import SalesTab from "./sales/SalesTab";
import PaymentTab from "./sales/PaymentTab";
import AgeingTab from "./sales/AgeingTab";

const API = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8001"}/api/sales`;

const TABS = [
  { id: "sales", label: "Sales Dashboard", icon: Building },
  { id: "payment", label: "Payment Summary", icon: CreditCard },
  { id: "ageing", label: "Ageing Report", icon: Clock },
];

export default function SalesDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("sales");
  const [filters, setFilters] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [ageingData, setAgeingData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [company, setCompany] = useState("");
  const [project, setProject] = useState("");
  const [tower, setTower] = useState("");
  const [unitType, setUnitType] = useState("");
  const [unitNo, setUnitNo] = useState("");
  const [loanStatus, setLoanStatus] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [ageingBucket, setAgeingBucket] = useState("");

  const buildParams = useCallback(() => {
    const p = {};
    if (company) p.company = company;
    if (project) p.project = project;
    if (tower) p.tower = tower;
    if (unitType) p.unit_type = unitType;
    if (unitNo) p.unit_no = unitNo;
    if (loanStatus) p.loan_status = loanStatus;
    if (month) p.month = month;
    if (year) p.year = year;
    if (ageingBucket) p.ageing_bucket = ageingBucket;
    return p;
  }, [company, project, tower, unitType, unitNo, loanStatus, month, year, ageingBucket]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = buildParams();
    try {
      if (tab === "sales") {
        const res = await axios.get(`${API}/data`, { params });
        setSalesData(res.data);
      } else if (tab === "payment") {
        const res = await axios.get(`${API}/payment`, { params });
        setPaymentData(res.data);
      } else {
        const res = await axios.get(`${API}/ageing`, { params });
        setAgeingData(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
    }
  }, [tab, buildParams]);

  useEffect(() => {
    axios.get(`${API}/filters`).then(r => setFilters(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetFilters = () => {
    setCompany(""); setProject(""); setTower(""); setUnitType("");
    setUnitNo(""); setLoanStatus(""); setMonth(""); setYear(""); setAgeingBucket("");
  };

  const tabIdx = TABS.findIndex(t => t.id === tab);
  const prevTab = () => setTab(TABS[(tabIdx - 1 + TABS.length) % TABS.length].id);
  const nextTab = () => setTab(TABS[(tabIdx + 1) % TABS.length].id);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex" data-testid="sales-dashboard-page">
      {/* Sidebar */}
      <aside className="w-56 border-r border-zinc-200 bg-white flex-shrink-0 flex flex-col sticky top-0 h-screen overflow-y-auto" data-testid="sales-sidebar">
        <div className="p-4 border-b border-zinc-200">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => nav("/")}>
            <div className="w-8 h-8 bg-zinc-950 text-white flex items-center justify-center text-sm font-bold" style={{ fontFamily: 'var(--font-heading)' }}>S</div>
            <div>
              <div className="text-xs font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>SMART WORLD</div>
              <div className="text-[8px] text-zinc-400 tracking-[0.12em] uppercase">Live, Quick, Play</div>
            </div>
          </div>
        </div>

        <div className="px-3 pt-4 flex-1">
          <SideFilter label="Company Name" value={company} onChange={setCompany} testId="sf-company">
            <option value="">All</option>
            {filters?.companies?.map(c => <option key={c} value={c}>{c}</option>)}
          </SideFilter>
          <SideFilter label="Project Name" value={project} onChange={setProject} testId="sf-project">
            <option value="">All</option>
            {filters?.projects?.map(p => <option key={p} value={p}>{p}</option>)}
          </SideFilter>
          <SideFilter label="Tower" value={tower} onChange={setTower} testId="sf-tower">
            <option value="">All</option>
            {filters?.towers?.map(t => <option key={t} value={t}>{t}</option>)}
          </SideFilter>
          <SideFilter label="Unit Type" value={unitType} onChange={setUnitType} testId="sf-unittype">
            <option value="">All</option>
            {filters?.unit_types?.map(u => <option key={u} value={u}>{u}</option>)}
          </SideFilter>
          <SideFilter label="Loan Status" value={loanStatus} onChange={setLoanStatus} testId="sf-loan">
            <option value="">All</option>
            {filters?.loan_statuses?.map(l => <option key={l} value={l}>{l}</option>)}
          </SideFilter>
          <SideFilter label="Month" value={month} onChange={setMonth} testId="sf-month">
            <option value="">All</option>
            {filters?.months?.map(m => <option key={m} value={m}>{m}</option>)}
          </SideFilter>
          <SideFilter label="Year" value={year} onChange={setYear} testId="sf-year">
            <option value="">All</option>
            {filters?.years?.map(y => <option key={y} value={y}>{y}</option>)}
          </SideFilter>
          {tab === "ageing" && (
            <SideFilter label="Ageing Days" value={ageingBucket} onChange={setAgeingBucket} testId="sf-ageing">
              <option value="">All</option>
              <option value="1-30 Days">1-30 Days</option>
              <option value="31-90 Days">31-90 Days</option>
              <option value="91-180 Days">91-180 Days</option>
              <option value="181+ Days">181+ Days</option>
            </SideFilter>
          )}
          <button data-testid="sf-reset" className="w-full mt-2 py-1.5 text-[9px] font-semibold tracking-[0.08em] uppercase border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-colors flex items-center justify-center gap-1.5" onClick={resetFilters}>
            <RefreshCw className="w-3 h-3" /> Reset All
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with tab navigation */}
        <header className="h-14 flex-shrink-0 border-b border-zinc-200 bg-white flex items-center justify-between px-5 sticky top-0 z-30" data-testid="sales-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button onClick={prevTab} className="w-7 h-7 flex items-center justify-center border border-zinc-200 hover:bg-zinc-50 transition-colors" data-testid="tab-prev">
                <ChevronLeft className="w-4 h-4 text-zinc-500" />
              </button>
              {TABS.map(t => (
                <button
                  key={t.id}
                  data-testid={`tab-${t.id}`}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold tracking-tight transition-all border ${
                    tab === t.id
                      ? "bg-zinc-950 text-white border-zinc-950"
                      : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
                  }`}
                  onClick={() => setTab(t.id)}
                >
                  <t.icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              ))}
              <button onClick={nextTab} className="w-7 h-7 flex items-center justify-center border border-zinc-200 hover:bg-zinc-50 transition-colors" data-testid="tab-next">
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
            <span className="text-sm font-bold tracking-tight ml-4" style={{ fontFamily: 'var(--font-heading)' }}>ALL PROJECTS</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={`${API}/download`} className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-900 tracking-wide uppercase font-medium px-3 py-1.5 border border-zinc-200 hover:border-zinc-400 transition-colors" data-testid="sales-download-btn">
              <Download className="w-3 h-3" /> Download
            </a>
            <button className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-900 tracking-wide uppercase font-medium px-3 py-1.5 border border-zinc-200 hover:border-zinc-400 transition-colors" onClick={() => nav("/upload")} data-testid="sales-upload-btn">
              <Upload className="w-3 h-3" /> Update
            </button>
            <button className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-900 tracking-wide uppercase font-medium px-3 py-1.5 border border-zinc-200 hover:border-zinc-400 transition-colors" onClick={() => nav("/")} data-testid="sales-back-btn">
              <ArrowLeft className="w-3 h-3" /> Portal
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" data-testid="sales-canvas">
          {loading ? (
            <div className="flex-1 flex items-center justify-center h-64" data-testid="sales-loader">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-zinc-200 border-t-zinc-600 rounded-full animate-spin mx-auto mb-3"></div>
                <div className="text-xs text-zinc-400">Loading...</div>
              </div>
            </div>
          ) : (
            <>
              {tab === "sales" && salesData && <SalesTab data={salesData} />}
              {tab === "payment" && paymentData && <PaymentTab data={paymentData} />}
              {tab === "ageing" && ageingData && <AgeingTab data={ageingData} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SideFilter({ label, value, onChange, children, testId }) {
  return (
    <div className="mb-3">
      <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-500 mb-1">{label}</div>
      <select
        data-testid={testId}
        className="w-full bg-zinc-50 border border-zinc-200 py-1.5 px-2 text-xs text-zinc-700 outline-none focus:border-zinc-400 transition-colors appearance-none cursor-pointer"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='5'%3E%3Cpath d='M0 0l4.5 5L9 0z' fill='%23A1A1AA'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  );
}
