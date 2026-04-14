import { fShort } from "./utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function WBSBar({ data, budgets }) {
  if (!data?.length) return null;
  
  // Build budget map from budgets prop
  const budgetMap = {};
  if (budgets) {
    budgets.forEach(b => { budgetMap[b.wbs] = b.budget; });
  }
  
  const chartData = data.map(d => ({
    name: d.wbs?.slice(0, 16) || "WBS",
    Budget: budgetMap[d.wbs] || 0,
    "Ordered GST": d.ordered,
    "Still to Deliver": d.still_to_deliver,
  }));

  return (
    <div className="border border-zinc-200 bg-white p-5" data-testid="wbs-bar-panel">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Top WBS — Budget vs Ordered vs Still to Deliver</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Top 10 WBS by Ordered Value</div>
        </div>
        <span className="text-[8px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-400">GROUPED BAR</span>
      </div>
      <div style={{ height: 240 }} data-testid="wbs-bar-chart">
        <ResponsiveContainer>
          <BarChart data={chartData} barGap={1}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
            <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#71717A" }} angle={-30} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => fShort(v)} />
            <Tooltip formatter={v => fShort(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
            <Bar dataKey="Budget" fill="rgba(26,79,160,0.35)" radius={0} />
            <Bar dataKey="Ordered GST" fill="#1A4FA0" radius={0} />
            <Bar dataKey="Still to Deliver" fill="#5B2A8A" radius={0} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {[
          { label: "Budget", color: "rgba(26,79,160,0.35)" },
          { label: "Ordered GST", color: "#1A4FA0" },
          { label: "Still to Deliver", color: "#5B2A8A" },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[9px] text-zinc-500">
            <span className="w-2 h-2 flex-shrink-0" style={{ background: l.color }}></span>{l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
