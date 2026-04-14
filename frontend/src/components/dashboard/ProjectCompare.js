import { fShort, COLORS } from "./utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ProjectCompare({ kpi }) {
  if (!kpi) return null;
  const chartData = [
    { name: "Ordered GST", PROJECT: kpi.proj?.ordered || 0, "NON-PROJECT": kpi.non_proj?.ordered || 0 },
    { name: "Delivered GST", PROJECT: kpi.proj?.delivered || 0, "NON-PROJECT": kpi.non_proj?.delivered || 0 },
    { name: "Invoiced GST", PROJECT: kpi.proj?.invoiced || 0, "NON-PROJECT": kpi.non_proj?.invoiced || 0 },
    { name: "Still to Deliver", PROJECT: kpi.proj?.still_to_deliver || 0, "NON-PROJECT": kpi.non_proj?.still_to_deliver || 0 },
    { name: "Still to Invoice", PROJECT: kpi.proj?.still_to_invoice || 0, "NON-PROJECT": kpi.non_proj?.still_to_invoice || 0 },
  ];

  return (
    <div className="border border-zinc-200 bg-white p-5" data-testid="project-compare-panel">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>PROJECT vs NON-PROJECT Breakdown</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Key metrics split by project type</div>
        </div>
        <span className="text-[8px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-400">COMPARISON</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 border border-blue-100 p-3">
          <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-blue-600 mb-2">PROJECT (RE/)</div>
          {[
            ["WBS", kpi.wbs_proj], ["Budget", fShort(kpi.budget_proj)],
            ["Ordered GST", fShort(kpi.proj?.ordered)], ["Delivered GST", fShort(kpi.proj?.delivered)],
            ["Still to Deliver", fShort(kpi.proj?.still_to_deliver)], ["Still to Invoice", fShort(kpi.proj?.still_to_invoice)]
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between py-0.5">
              <span className="text-[10px] text-zinc-400">{l}</span>
              <span className="text-[10px] font-bold text-blue-700">{v}</span>
            </div>
          ))}
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-3">
          <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-emerald-600 mb-2">NON-PROJECT (HO/)</div>
          {[
            ["WBS", kpi.wbs_non], ["Budget", fShort(kpi.budget_non)],
            ["Ordered GST", fShort(kpi.non_proj?.ordered)], ["Delivered GST", fShort(kpi.non_proj?.delivered)],
            ["Still to Deliver", fShort(kpi.non_proj?.still_to_deliver)], ["Still to Invoice", fShort(kpi.non_proj?.still_to_invoice)]
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between py-0.5">
              <span className="text-[10px] text-zinc-400">{l}</span>
              <span className="text-[10px] font-bold text-emerald-700">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 180 }} data-testid="project-compare-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#71717A" }} />
            <YAxis tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => fShort(v)} />
            <Tooltip formatter={v => fShort(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
            <Bar dataKey="PROJECT" fill={COLORS.project} radius={0} />
            <Bar dataKey="NON-PROJECT" fill={COLORS.nonProject} radius={0} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
