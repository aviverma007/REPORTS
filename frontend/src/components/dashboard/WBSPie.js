import { fShort, COLORS } from "./utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function WBSPie({ data }) {
  if (!data?.length) return null;
  const chartData = data.map((d, i) => ({
    name: d.wbs?.slice(0, 22) || `WBS ${i}`,
    value: d.budget,
    color: d.is_project ? COLORS.project : COLORS.nonProject
  }));

  return (
    <div className="border border-zinc-200 bg-white p-5" data-testid="wbs-pie-panel">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Top WBS Budget Allocation by Project Type</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Budget distribution — top WBS elements coloured by type</div>
        </div>
        <span className="text-[8px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-400">PIE</span>
      </div>
      <div style={{ height: 220 }} data-testid="wbs-pie-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" stroke="#fff" strokeWidth={2}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={v => fShort(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {chartData.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[9px] text-zinc-500">
            <span className="w-2 h-2 flex-shrink-0" style={{ background: item.color }}></span>
            {item.name} {fShort(item.value)}
          </div>
        ))}
      </div>
    </div>
  );
}
