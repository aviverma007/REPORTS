import { fCrs, fNum, COLORS } from "./utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function AgeingTab({ data }) {
  if (!data) return null;
  const { kpi, ageing_buckets, billed_milestones, unbilled_milestones, billed_total_count, billed_total_amount } = data;

  return (
    <div className="flex flex-col gap-4" data-testid="ageing-tab">
      {/* Row 1: Ageing charts + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Installment Count by Ageing */}
        <div className="lg:col-span-2 border border-zinc-200 bg-white p-4" data-testid="ageing-count-panel">
          <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Installment Count by Ageing</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageing_buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                <XAxis dataKey="bucket" tick={{ fontSize: 9, fill: "#71717A" }} />
                <YAxis tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v} />
                <Tooltip formatter={v => fNum(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
                <Bar dataKey="count" fill="#3B82F6" radius={0} name="Installment Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Installment Amount by Ageing */}
        <div className="lg:col-span-2 border border-zinc-200 bg-white p-4" data-testid="ageing-amount-panel">
          <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Installment Amount by Ageing</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageing_buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                <XAxis dataKey="bucket" tick={{ fontSize: 9, fill: "#71717A" }} />
                <YAxis tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => v >= 1 ? Math.round(v) + ' Crs' : v} />
                <Tooltip formatter={v => fCrs(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
                <Bar dataKey="amount" fill="#3B82F6" radius={0} name="Outstanding Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="flex flex-col gap-3" data-testid="ageing-kpi-col">
          {[
            { label: "Demand Amount", value: kpi.demand, color: "border-l-blue-500" },
            { label: "Received Amount", value: kpi.received, color: "border-l-emerald-500" },
            { label: "Outstanding Amount", value: kpi.outstanding, color: "border-l-rose-500" },
          ].map((item, i) => (
            <div key={i} data-testid={`ageing-kpi-${i}`} className={`border border-zinc-200 bg-white p-4 border-l-[3px] ${item.color} flex-1 flex flex-col justify-center`}>
              <div className="text-[8px] font-bold tracking-[0.08em] uppercase text-zinc-400 mb-1">{item.label}</div>
              <div className="text-xl font-bold tracking-tight text-zinc-950" style={{ fontFamily: 'var(--font-heading)' }}>{fCrs(item.value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Billed Milestones Table */}
      <div className="border border-zinc-200 bg-white p-4" data-testid="billed-milestones-panel">
        <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Billed Milestones</div>
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-y border-zinc-200 bg-zinc-50 sticky top-0">
                {["Milestone", "Ageing Bucket", "Billed Milestone Count", "Billed Installment Amount Crs"].map(h => (
                  <th key={h} className="text-[9px] font-bold tracking-[0.08em] uppercase text-zinc-400 py-2 px-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {billed_milestones.map((r, i) => (
                <tr key={i} className={`border-b border-zinc-100 ${i % 2 === 0 ? 'bg-amber-50/40' : ''}`} data-testid={`billed-row-${i}`}>
                  <td className="py-1.5 px-3 text-[11px] font-medium text-zinc-700 max-w-[300px]">{r.milestone}</td>
                  <td className="py-1.5 px-3 text-[11px] text-zinc-600">{r.ageing_bucket}</td>
                  <td className="py-1.5 px-3 text-[11px] font-semibold text-right">{fNum(r.count)}</td>
                  <td className="py-1.5 px-3 text-[11px] font-semibold text-right">{fCrs(r.amount)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-zinc-300 bg-zinc-50 font-bold">
                <td colSpan={2} className="py-2 px-3 text-xs">Total</td>
                <td className="py-2 px-3 text-xs text-right">{fNum(billed_total_count)}</td>
                <td className="py-2 px-3 text-xs text-right">{fCrs(billed_total_amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Unbilled Milestones */}
      <div className="text-center">
        <div className="inline-block text-sm font-bold tracking-tight px-4 py-1 border-b-2 border-blue-500" style={{ fontFamily: 'var(--font-heading)' }}>UNBILLED MILESTONES</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-zinc-200 bg-white p-4" data-testid="unbilled-count-panel">
          <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Unbilled Milestone Count by Milestone</div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unbilled_milestones.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                <XAxis dataKey="milestone" tick={{ fontSize: 8, fill: "#71717A" }} angle={-25} textAnchor="end" height={70} interval={0} />
                <YAxis tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v} />
                <Tooltip formatter={v => fNum(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
                <Bar dataKey="count" fill="#3B82F6" radius={0} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="border border-zinc-200 bg-white p-4" data-testid="unbilled-amount-panel">
          <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Unbilled Installment Amount Crs by Milestone</div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unbilled_milestones.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                <XAxis dataKey="milestone" tick={{ fontSize: 8, fill: "#71717A" }} angle={-25} textAnchor="end" height={70} interval={0} />
                <YAxis tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => v >= 1 ? Math.round(v) + ' Crs' : v} />
                <Tooltip formatter={v => fCrs(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
                <Bar dataKey="amount" fill="#3B82F6" radius={0} name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
