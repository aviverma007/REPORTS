import { fCrs, fNum, COLORS } from "./utils";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const MODE_COLORS = {
  "ONLINE": "#3B82F6", "CREDIT": "#1D4ED8", "CHEQUE": "#EA580C",
  "TDS CHALLAN": "#6B21A8", "REBATE": "#EC4899"
};

export default function PaymentTab({ data }) {
  if (!data) return null;
  const { kpi, by_mode, total_payments } = data;

  const donutData = by_mode.map(m => ({
    name: m.mode, value: m.count, color: MODE_COLORS[m.mode] || "#71717A"
  }));

  return (
    <div className="flex flex-col gap-4" data-testid="payment-tab">
      {/* KPI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-testid="payment-kpi-row">
        {[
          { label: "Total Collection Amount", value: kpi.total_collected, color: "border-t-blue-500" },
          { label: "Self Funded Amount", value: kpi.self_funded, color: "border-t-indigo-500" },
          { label: "Bank Funded Amount", value: kpi.bank_funded, color: "border-t-violet-500" },
        ].map((item, i) => (
          <div key={i} data-testid={`payment-kpi-${i}`} className={`border border-zinc-200 bg-white p-5 relative border-t-[3px] ${item.color}`}>
            <div className="text-[9px] font-bold tracking-[0.08em] uppercase text-zinc-400 mb-1">{item.label}</div>
            <div className="text-2xl font-bold tracking-tight text-zinc-950" style={{ fontFamily: 'var(--font-heading)' }}>{fCrs(item.value)}</div>
          </div>
        ))}
      </div>

      {/* Donut + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-zinc-200 bg-white p-4" data-testid="payment-donut-panel">
          <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>TOTAL PAYMENTS</div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="#fff" strokeWidth={2}>
                  {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={v => fNum(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-lg font-bold -mt-2" style={{ fontFamily: 'var(--font-heading)' }}>TOTAL {fNum(total_payments)}</div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {donutData.map((d, i) => (
              <span key={i} className="flex items-center gap-1 text-[9px] text-zinc-500">
                <span className="w-2 h-2 flex-shrink-0" style={{ background: d.color }}></span>{d.name}
              </span>
            ))}
          </div>
        </div>

        <div className="border border-zinc-200 bg-white p-4" data-testid="payment-count-bar-panel">
          <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>TOTAL NUMBER OF PAYMENTS</div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={by_mode}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                <XAxis dataKey="mode" tick={{ fontSize: 9, fill: "#71717A" }} />
                <YAxis tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v} />
                <Tooltip formatter={v => fNum(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
                <Bar dataKey="count" radius={0} name="Total Payments">
                  {by_mode.map((m, i) => <Cell key={i} fill={MODE_COLORS[m.mode] || "#71717A"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Amount Collected + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-zinc-200 bg-white p-4" data-testid="amount-collected-panel">
          <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>AMOUNT COLLECTED</div>
          <div className="flex gap-3 mb-2 text-[9px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500"></span>Collected Amount</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500"></span>Cancelled/Bounce Amount</span>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={by_mode}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                <XAxis dataKey="mode" tick={{ fontSize: 9, fill: "#71717A" }} />
                <YAxis tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => v >= 1 ? Math.round(v) + ' Crs' : v} />
                <Tooltip formatter={v => fCrs(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
                <Bar dataKey="collected" fill="#3B82F6" radius={0} name="Collected Amount" />
                <Bar dataKey="bounce" fill="#DC2626" radius={0} name="Cancelled/Bounce" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-zinc-200 bg-white p-4" data-testid="payment-mode-table">
          <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Payment Mode Summary</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-y border-zinc-200 bg-zinc-50">
                  <th className="text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-400 py-2 px-3">Mode of Payment</th>
                  <th className="text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-400 py-2 px-3 text-right">Total Payments</th>
                  <th className="text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-400 py-2 px-3 text-right">Collected Amount</th>
                </tr>
              </thead>
              <tbody>
                {by_mode.map((m, i) => (
                  <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50" data-testid={`payment-table-row-${i}`}>
                    <td className="py-2 px-3 text-xs font-bold" style={{ color: MODE_COLORS[m.mode] }}>{m.mode}</td>
                    <td className="py-2 px-3 text-xs text-right font-semibold">{fNum(m.count)}</td>
                    <td className="py-2 px-3 text-xs text-right font-semibold">{fCrs(m.collected)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-zinc-300 bg-zinc-50 font-bold">
                  <td className="py-2 px-3 text-xs">Total</td>
                  <td className="py-2 px-3 text-xs text-right">{fNum(by_mode.reduce((a, b) => a + b.count, 0))}</td>
                  <td className="py-2 px-3 text-xs text-right">{fCrs(by_mode.reduce((a, b) => a + b.collected, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
