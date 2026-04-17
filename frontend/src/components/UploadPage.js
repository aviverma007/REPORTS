import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Upload, ArrowLeft, FileSpreadsheet, CheckCircle2, AlertCircle, Download } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8001"}/api`;

export default function UploadPage({ onDataUpdated }) {
  const nav = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setError("Only .xlsx, .xls, .csv files are accepted");
      return;
    }
    setUploading(true);
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data);
      if (onDataUpdated) onDataUpdated();
    } catch (e) {
      setError(e.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [onDataUpdated]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="upload-page">
      {/* Nav */}
      <nav className="h-14 border-b border-zinc-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => nav("/")}>
          <div className="w-8 h-8 bg-zinc-950 text-white flex items-center justify-center text-sm font-bold" style={{ fontFamily: 'var(--font-heading)' }}>S</div>
          <div>
            <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>SmartWorld</div>
            <div className="text-[9px] text-zinc-400 tracking-[0.14em] uppercase">Analytics Platform</div>
          </div>
        </div>
        <button data-testid="upload-back-btn" className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors tracking-wide uppercase font-medium px-3 py-1.5 border border-zinc-200 hover:border-zinc-400" onClick={() => nav("/")}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="w-14 h-14 bg-zinc-950 text-white flex items-center justify-center text-2xl font-light mb-6" style={{ fontFamily: 'var(--font-heading)' }}>S</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-zinc-950 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Update <span className="font-light italic text-zinc-400">Excel Data</span>
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed mb-10 max-w-lg">
          Upload the latest Excel files for each report module. Charts, KPIs and filters refresh automatically from your new data.
        </p>

        {/* ZALR Upload Card */}
        <div className="border border-zinc-200 bg-white p-6 mb-6" data-testid="upload-zalr-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-zinc-950 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>ZALR Cost Dashboard</div>
              <div className="text-xs text-zinc-400">ZALR procurement report</div>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[9px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live
            </span>
          </div>

          {/* Drop Zone */}
          <div
            data-testid="upload-dropzone"
            className={`border-2 border-dashed p-12 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all ${
              dragActive ? "border-zinc-500 bg-zinc-100" : "border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
              data-testid="upload-file-input"
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin"></div>
                <span className="text-xs text-zinc-500">Uploading...</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-zinc-300" />
                <div className="text-sm font-medium text-zinc-600">Upload ZALR.xlsx</div>
                <div className="text-xs text-zinc-400">Drop file here or click to browse</div>
              </>
            )}
          </div>

          {result && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs" data-testid="upload-success">
              <CheckCircle2 className="w-4 h-4" />
              {result.message} — {result.rows_count} rows loaded
            </div>
          )}
          {error && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs" data-testid="upload-error">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <a
              href={`${API}/download`}
              data-testid="download-current-btn"
              className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors tracking-wide uppercase font-medium px-3 py-1.5 border border-zinc-200 hover:border-zinc-400"
            >
              <Download className="w-3.5 h-3.5" /> Download Current Data
            </a>
          </div>
        </div>

        {/* Disabled cards */}
        {["Project Progress", "Vendor Performance", "Budget Variance"].map((title) => (
          <div key={title} className="border border-zinc-100 bg-white/50 p-5 mb-3 opacity-40 pointer-events-none">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-300">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-400">{title}</div>
                <div className="text-xs text-zinc-300">Coming soon</div>
              </div>
            </div>
          </div>
        ))}

        {/* Instructions */}
        <div className="border border-zinc-200 bg-white p-6 mt-8" data-testid="upload-instructions">
          <h3 className="text-sm font-bold tracking-tight mb-4" style={{ fontFamily: 'var(--font-heading)' }}>How to Update Data</h3>
          {[
            "Export the latest ZALR report from SAP in Excel format (.xlsx or .xls).",
            "Click the upload zone above and select your file, or drag and drop it directly.",
            "The dashboard re-reads the new file and refreshes all KPIs, charts and filters instantly.",
            "Keep column headers unchanged — the system auto-detects columns by name."
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
              <span className="w-6 h-6 bg-zinc-950 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
              <span className="text-xs text-zinc-500 leading-relaxed pt-1">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
