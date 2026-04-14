import { fShort, COLORS } from "./utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MONTHS_SHORT = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MonthlyTrend({ data }) {
  if (!data?.length) return null;
  const chartData = data.map(d => ({
    name: `${MONTHS_SHORT[d.month]} ${d.year}`,
    "Ordered — PROJECT": d.ord_proj,
    "Ordered — NON-PROJECT": d.ord_non,
    "Delivered — PROJECT": d.del_proj,
    "Delivered — NON-PROJECT": d.del_non,
  }));

  return (
    <div className="border border-zinc-200 bg-white p-5" data-testid="monthly-trend-panel">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Month-wise Ordered vs Delivered (GST)</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Trend by Document Date — split by project type</div>
        </div>
        <span className="text-[8px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-400">LINE</span>
      </div>
      <div style={{ height: 220 }} data-testid="monthly-trend-chart">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#71717A" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => fShort(v)} />
            <Tooltip formatter={v => fShort(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
            <Line type="monotone" dataKey="Ordered — PROJECT" stroke={COLORS.project} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Ordered — NON-PROJECT" stroke={COLORS.nonProject} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Delivered — PROJECT" stroke="#5090E0" strokeWidth={2} dot={false} strokeDasharray="4 3" />
            <Line type="monotone" dataKey="Delivered — NON-PROJECT" stroke="#50C090" strokeWidth={2} dot={false} strokeDasharray="4 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {[
          { label: "Ordered — PROJECT", color: COLORS.project },
          { label: "Ordered — NON-PROJECT", color: COLORS.nonProject },
          { label: "Delivered — PROJECT", color: "#5090E0" },
          { label: "Delivered — NON-PROJECT", color: "#50C090" },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[9px] text-zinc-500">
            <span className="w-2 h-2 flex-shrink-0" style={{ background: l.color }}></span>{l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
