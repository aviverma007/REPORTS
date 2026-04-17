import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Wallet, BarChart3, Factory, TrendingUp, Users,
  Building2, Receipt, Search, ArrowRight, ChevronDown, Upload, Check
} from "lucide-react";

// Data loaded from Excel via DataContext - no backend needed

const ICON_MAP = {
  wallet: Wallet, "bar-chart-3": BarChart3, factory: Factory,
  "trending-up": TrendingUp, users: Users, "building-2": Building2,
  receipt: Receipt, search: Search
};

function fCr(v) {
  const c = v / 1e7;
  if (c >= 1000) return Math.round(c / 100) * 100 + " Cr";
  if (c >= 100) return Math.round(c) + " Cr";
  if (c >= 1) return c.toFixed(1) + " Cr";
  return (v / 1e5).toFixed(1) + " L";
}

export default function LandingPage() {
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [modules, setModules] = useState([]);
  const [comingSoonModule, setComingSoonModule] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const UPLOAD_OPTIONS = [
    { id: "zalr", label: "ZALR Cost Report", endpoint: `${API}/upload`, accept: ".xlsx,.xls,.csv" },
    { id: "sales", label: "Sales Report", endpoint: `${API}/sales/upload`, accept: ".xlsx,.xls,.csv" },
    { id: "cases", label: "Case Management Report", endpoint: `${API}/cases/upload`, accept: ".xlsx,.xls" },
  ];

  const handleFileUpload = async (opt, file) => {
    if (!file) return;
    setUploading(opt.id);
    setUploadSuccess(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(opt.endpoint, { method: "POST", body: fd });
      const result = await res.json();
      if (res.ok) {
        setUploadSuccess(opt.id);
        setTimeout(() => setUploadSuccess(null), 3000);
      } else {
        alert(result.detail || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    }
    setUploading(null);
  };

  useEffect(() => {
    axios.get(`${API}/stats`).then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API}/modules`).then(r => setModules(r.data)).catch(() => {});
  }, []);

  const handleModuleClick = (mod) => {
    if (mod.status === "live") {
      if (mod.id === "sales") nav("/sales");
      else if (mod.id === "cases") nav("/cases");
      else nav("/dashboard");
    } else {
      setComingSoonModule(mod);
    }
  };

  return (
    <div className="min-h-screen bg-white" data-testid="landing-page">
      {/* Coming Soon Modal */}
      {comingSoonModule && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          data-testid="coming-soon-modal"
          onClick={() => setComingSoonModule(null)}
        >
          <div
            className="bg-white border border-zinc-200 p-10 max-w-md text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-5">
              <Search className="w-5 h-5 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Coming Soon
            </h3>
            <p className="text-sm text-zinc-500 mb-6">{comingSoonModule.title} is under development.</p>
            <button
              data-testid="coming-soon-close-btn"
              className="bg-zinc-950 text-white px-6 py-2 text-xs tracking-widest uppercase font-semibold hover:bg-zinc-800 transition-colors"
              onClick={() => setComingSoonModule(null)}
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* Top Nav */}
      <nav className="h-14 border-b border-zinc-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-6" data-testid="top-nav">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => nav("/")}>
          <div className="w-8 h-8 bg-zinc-950 text-white flex items-center justify-center text-sm font-bold" style={{ fontFamily: 'var(--font-heading)' }}>S</div>
          <div>
            <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>SmartWorld</div>
            <div className="text-[9px] text-zinc-400 tracking-[0.14em] uppercase">Analytics Platform</div>
          </div>
        </div>
        <div className="flex items-center gap-3 relative">
          <button
            data-testid="nav-upload-btn"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors tracking-wide uppercase font-medium px-3 py-1.5 border border-zinc-200 hover:border-zinc-400"
            onClick={() => setUploadOpen(p => !p)}
          >
            <Upload className="w-3.5 h-3.5" /> Update Excel <ChevronDown className={`w-3 h-3 transition-transform ${uploadOpen ? "rotate-180" : ""}`} />
          </button>
          {uploadOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setUploadOpen(false)} />
              <div data-testid="upload-dropdown" className="absolute right-0 top-full mt-2 bg-white border border-zinc-200 shadow-lg z-40 w-64">
                <p className="text-[9px] font-bold tracking-[0.14em] uppercase text-zinc-400 px-4 pt-3 pb-1">Upload report data</p>
                {UPLOAD_OPTIONS.map(opt => (
                  <label
                    key={opt.id}
                    data-testid={`upload-option-${opt.id}`}
                    className={`flex items-center gap-2.5 px-4 py-2.5 hover:bg-zinc-50 cursor-pointer transition-colors border-t border-zinc-100 ${uploading === opt.id ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {uploadSuccess === opt.id ? (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Upload className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    )}
                    <span className="text-xs text-zinc-700 font-medium">{uploading === opt.id ? "Uploading..." : opt.label}</span>
                    <input
                      type="file"
                      accept={opt.accept}
                      className="hidden"
                      onChange={e => { handleFileUpload(opt, e.target.files?.[0]); e.target.value = ""; }}
                    />
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="w-20 h-20 bg-zinc-950 text-white flex items-center justify-center text-4xl font-light mx-auto mb-8 opacity-0 animate-fade-up" style={{ fontFamily: 'var(--font-heading)' }}>
            S
          </div>
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-zinc-400 mb-4 opacity-0 animate-fade-up stagger-1">
            Analytics & Intelligence Platform
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-zinc-950 mb-3 opacity-0 animate-fade-up stagger-2" style={{ fontFamily: 'var(--font-heading)' }}>
            SmartWorld<br /><span className="font-light italic text-zinc-400">Developers</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 leading-relaxed max-w-xl mx-auto mb-10 opacity-0 animate-fade-up stagger-3">
            Enterprise-grade reporting suite for procurement, cost control, and project analytics crafted for Smart World operations.
          </p>
          <button
            data-testid="hero-cta-btn"
            className="inline-flex items-center gap-3 bg-zinc-950 text-white px-8 py-3.5 text-xs tracking-[0.18em] uppercase font-bold hover:bg-zinc-800 transition-all hover:gap-5 opacity-0 animate-fade-up stagger-4"
            onClick={() => {
              document.getElementById('reports-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Open Reports Portal <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute bottom-8 animate-bounce">
          <ChevronDown className="w-5 h-5 text-zinc-300" />
        </div>
      </section>

      {/* Stats Bar removed */}

      {/* Reports Section */}
      <section id="reports-section" className="py-20 px-6" data-testid="reports-section">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-zinc-400 mb-3">Analytics Suite</p>
            <div className="w-12 h-px bg-zinc-300 mx-auto mb-5"></div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-zinc-950 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Select Your <span className="font-light italic text-zinc-400">Report</span>
            </h2>
            <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
              Choose from 8 specialised report modules. Each provides live, filterable analytics powered by your latest Excel data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((mod, i) => {
              const IconComp = ICON_MAP[mod.icon] || Wallet;
              const isLive = mod.status === "live";
              return (
                <div
                  key={mod.id}
                  data-testid={`report-card-${mod.id}`}
                  className={`group border bg-white p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
                    isLive ? "border-zinc-300 shadow-sm" : "border-zinc-200"
                  }`}
                  onClick={() => handleModuleClick(mod)}
                >
                  <div className={`w-10 h-10 flex items-center justify-center border mb-4 transition-colors ${
                    isLive ? "bg-zinc-950 border-zinc-950 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-400 group-hover:bg-zinc-100"
                  }`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight text-zinc-950 mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>{mod.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mb-4">{mod.description}</p>
                  <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 ${
                    isLive ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : "bg-zinc-50 border border-zinc-200 text-zinc-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-zinc-300"}`}></span>
                    {isLive ? "Live" : "Coming Soon"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-7 border-t border-zinc-200 bg-white">
        <div className="text-xs text-zinc-400 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
          SmartWorld Developers — Internal Analytics Platform
        </div>
        <div className="text-[9px] text-zinc-300 tracking-[0.1em] mt-1">CONFIDENTIAL · FOR INTERNAL USE ONLY</div>
      </footer>
    </div>
  );
}
