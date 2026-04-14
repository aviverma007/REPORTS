import { fShort } from "./utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function YearlyStacked({ data }) {
  if (!data?.length) return null;
  const chartData = data.map(d => ({
    name: d.year,
    "Ordered GST": d.ordered,
    "Delivered GST": d.delivered,
    "Invoiced GST": d.invoiced,
    "Still to Deliver": d.still_to_deliver,
  }));

  return (
    <div className="border border-zinc-200 bg-white p-5" data-testid="yearly-stacked-panel">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Year-wise Cumulative Values</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Ordered · Delivered · Invoiced · Still to Deliver by year</div>
        </div>
        <span className="text-[8px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-400">STACKED</span>
      </div>
      <div style={{ height: 220 }} data-testid="yearly-stacked-chart">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#71717A" }} />
            <YAxis tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => fShort(v)} />
            <Tooltip formatter={v => fShort(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
            <Bar dataKey="Ordered GST" stackId="a" fill="#1A4FA0" radius={0} />
            <Bar dataKey="Delivered GST" stackId="a" fill="#1A7A4A" radius={0} />
            <Bar dataKey="Invoiced GST" stackId="a" fill="#C08A20" radius={0} />
            <Bar dataKey="Still to Deliver" stackId="a" fill="#5B2A8A" radius={0} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {[
          { label: "Ordered GST", color: "#1A4FA0" },
          { label: "Delivered GST", color: "#1A7A4A" },
          { label: "Invoiced GST", color: "#C08A20" },
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
