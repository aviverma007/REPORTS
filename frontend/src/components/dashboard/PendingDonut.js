import { fShort, COLORS } from "./utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function PendingDonut({ kpi }) {
  if (!kpi) return null;
  const items = [
    { name: "Still to Deliver — PROJECT", value: kpi.proj?.still_to_deliver || 0, color: COLORS.project },
    { name: "Still to Deliver — NON-PROJECT", value: kpi.non_proj?.still_to_deliver || 0, color: COLORS.nonProject },
    { name: "Still to Invoice — PROJECT", value: kpi.proj?.still_to_invoice || 0, color: "#E05A56" },
    { name: "Still to Invoice — NON-PROJECT", value: kpi.non_proj?.still_to_invoice || 0, color: "#7C3AED" },
  ];

  return (
    <div className="border border-zinc-200 bg-white p-5" data-testid="pending-donut-panel">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Still to Deliver vs Invoice</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Pending commitment breakdown</div>
        </div>
        <span className="text-[8px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-400">DONUT</span>
      </div>
      <div style={{ height: 200 }} data-testid="pending-donut-chart">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={items} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
              {items.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={v => fShort(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[9px] text-zinc-500">
            <span className="w-2 h-2 flex-shrink-0" style={{ background: item.color }}></span>
            {item.name.slice(0, 28)} {fShort(item.value)}
          </div>
        ))}
      </div>
    </div>
  );
}
