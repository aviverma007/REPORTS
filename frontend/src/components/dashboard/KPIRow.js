import { fCr, fShort } from "./utils";

export default function KPIRow({ kpi }) {
  if (!kpi) return null;
  const items = [
    { label: "WBS Count", value: kpi.wbs_count, unit: "Unique Elements", proj: `P: ${kpi.wbs_proj}`, non: `N: ${kpi.wbs_non}`, bar: "kpi-bar-wbs" },
    { label: "Total Budget", value: fCr(kpi.budget), unit: "INR Crores", proj: `P: ${fShort(kpi.budget_proj)}`, non: `N: ${fShort(kpi.budget_non)}`, bar: "kpi-bar-budget" },
    { label: "Count of PO", value: kpi.po_count?.toLocaleString(), unit: "Unique Documents", proj: `P: ${kpi.po_proj}`, non: `N: ${kpi.po_non}`, bar: "kpi-bar-po" },
    { label: "Ordered with GST", value: fCr(kpi.total?.ordered), unit: "INR Crores", proj: `P: ${fShort(kpi.proj?.ordered)}`, non: `N: ${fShort(kpi.non_proj?.ordered)}`, bar: "kpi-bar-ordered" },
    { label: "Delivered with GST", value: fCr(kpi.total?.delivered), unit: "INR Crores", proj: `P: ${fShort(kpi.proj?.delivered)}`, non: `N: ${fShort(kpi.non_proj?.delivered)}`, bar: "kpi-bar-delivered" },
    { label: "Invoiced with GST", value: fCr(kpi.total?.invoiced), unit: "INR Crores", proj: `P: ${fShort(kpi.proj?.invoiced)}`, non: `N: ${fShort(kpi.non_proj?.invoiced)}`, bar: "kpi-bar-invoiced" },
    { label: "Still to Deliver GST", value: fCr(kpi.total?.still_to_deliver), unit: "INR Crores", proj: `P: ${fShort(kpi.proj?.still_to_deliver)}`, non: `N: ${fShort(kpi.non_proj?.still_to_deliver)}`, bar: "kpi-bar-still-deliver" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3" data-testid="kpi-row">
      {items.map((item, i) => (
        <div
          key={i}
          data-testid={`kpi-card-${i}`}
          className="border border-zinc-200 bg-white p-4 relative overflow-hidden group hover:border-zinc-300 hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className={`absolute top-0 left-0 right-0 h-[3px] ${item.bar}`}></div>
          <div className="text-[8px] font-bold tracking-[0.1em] uppercase text-zinc-400 mb-1">{item.label}</div>
          <div className="text-xl font-bold tracking-tight text-zinc-950" style={{ fontFamily: 'var(--font-heading)' }}>{item.value}</div>
          <div className="text-[9px] text-zinc-400 mt-1">{item.unit}</div>
          <div className="flex gap-1 mt-2">
            <span className="flex-1 bg-blue-50 text-blue-600 text-[8px] font-semibold text-center py-0.5 px-1">{item.proj}</span>
            <span className="flex-1 bg-emerald-50 text-emerald-600 text-[8px] font-semibold text-center py-0.5 px-1">{item.non}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
