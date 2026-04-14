import { fCrs, fShortCrs, fNum, fSqft, COLORS } from "./utils";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function SalesTab({ data }) {
  if (!data) return null;
  const { kpi, units, channel_types, area, project_sales, month_sales } = data;

  return (
    <div className="flex flex-col gap-4" data-testid="sales-tab">
      {/* Row 1: Unit Donut + KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Unit Type Donut */}
        <div className="lg:col-span-2 border border-zinc-200 bg-white p-4" data-testid="unit-type-panel">
          <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-400 mb-2">TOTAL UNIT BY UNIT TYPE</div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: "Available", value: units.available },
                  { name: "Booked", value: units.booked },
                  { name: "Allotted", value: units.allotted }
                ]} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" stroke="#fff" strokeWidth={2}>
                  <Cell fill="#A78BFA" /><Cell fill="#6B21A8" /><Cell fill="#C4B5FD" />
                </Pie>
                <Tooltip formatter={v => fNum(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-2">
            <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Total {fNum(units.total)}</div>
          </div>
          <div className="flex justify-center gap-4 mt-2 text-[9px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#A78BFA]"></span>Available {fNum(units.available)}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#6B21A8]"></span>Booked {fNum(units.booked)}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#C4B5FD]"></span>Allotted {fNum(units.allotted)}</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="lg:col-span-4 grid grid-cols-5 gap-3" data-testid="sales-kpi-row">
          {[
            { label: "Total Sales (Crs)", value: kpi.total_sales, color: "border-t-violet-600" },
            { label: "Demand (Crs)", value: kpi.demand, color: "border-t-blue-500" },
            { label: "Received (Crs)", value: kpi.received, color: "border-t-emerald-500" },
            { label: "Outstanding (Crs)", value: kpi.outstanding, color: "border-t-amber-500" },
            { label: "Credit/Debit (Crs)", value: kpi.credit_debit, color: "border-t-rose-500" },
          ].map((item, i) => (
            <div key={i} data-testid={`sales-kpi-${i}`} className={`border border-zinc-200 bg-white p-3 relative border-t-[3px] ${item.color}`}>
              <div className="text-[8px] font-bold tracking-[0.08em] uppercase text-zinc-400 mb-1">{item.label}</div>
              <div className="text-xl font-bold tracking-tight text-zinc-950" style={{ fontFamily: 'var(--font-heading)' }}>{fNum(item.value?.toFixed(2))}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Channel Type + Built-up Area + Carpet Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DonutPanel
          testId="channel-type-panel"
          title="Total Booked Units by Channel Type"
          data={channel_types.map((c, i) => ({ ...c, color: i === 0 ? "#6B21A8" : "#A78BFA" }))}
          centerLabel={`Total ${fNum(channel_types.reduce((a, b) => a + b.value, 0))}`}
          formatter={v => fNum(v)}
        />
        <DonutPanel
          testId="builtup-area-panel"
          title="Built-up Area"
          data={[
            { name: "Booked Built-up Area", value: area.booked_builtup, color: "#CA8A04" },
            { name: "Leftover Built-up Area", value: area.leftover_builtup, color: "#FDE68A" }
          ]}
          centerLabel={`Total ${fSqft(area.total_builtup)}`}
          formatter={v => fSqft(v)}
        />
        <DonutPanel
          testId="carpet-area-panel"
          title="Carpet Area"
          data={[
            { name: "Booked Carpet Area", value: area.booked_carpet, color: "#7C3AED" },
            { name: "Leftover Carpet Area", value: area.leftover_carpet, color: "#DDD6FE" }
          ]}
          centerLabel={`Total ${fSqft(area.total_carpet)}`}
          formatter={v => fSqft(v)}
        />
      </div>

      {/* Row 3: Project-wise Sales + Month-wise Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-zinc-200 bg-white p-4" data-testid="project-sales-panel">
          <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>PROJECT WISE SALES</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={project_sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                <XAxis dataKey="project" tick={{ fontSize: 10, fill: "#71717A" }} />
                <YAxis tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => fShortCrs(v)} />
                <Tooltip formatter={v => fCrs(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
                <Bar dataKey="sales" fill="#6B21A8" radius={0} name="Total Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="border border-zinc-200 bg-white p-4" data-testid="month-sales-panel">
          <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>MONTH WISE SALES</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={month_sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#71717A" }} />
                <YAxis tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => fShortCrs(v)} />
                <Tooltip formatter={v => fCrs(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
                <Line type="monotone" dataKey="sales" stroke="#6B21A8" strokeWidth={2} dot={{ r: 4, fill: "#6B21A8" }} name="Sales" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Demand vs Received */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-zinc-200 bg-white p-4" data-testid="proj-demand-recv-panel">
          <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Project-Wise DEMAND VS RECEIVED</div>
          <div className="flex gap-3 mb-2 text-[9px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#6B21A8]"></span>TOTAL DEMAND</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#A78BFA]"></span>TOTAL RECEIVED</span>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={project_sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                <XAxis dataKey="project" tick={{ fontSize: 10, fill: "#71717A" }} />
                <YAxis tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => fShortCrs(v)} />
                <Tooltip formatter={v => fCrs(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
                <Bar dataKey="demand" fill="#6B21A8" radius={0} name="Total Demand" />
                <Bar dataKey="received" fill="#A78BFA" radius={0} name="Total Received" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="border border-zinc-200 bg-white p-4" data-testid="month-demand-recv-panel">
          <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>MONTH WISE DEMAND VS RECEIVED</div>
          <div className="flex gap-3 mb-2 text-[9px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#6B21A8]"></span>TOTAL DEMAND</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#A78BFA]"></span>TOTAL RECEIVED</span>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={month_sales} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                <XAxis type="number" tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={v => fShortCrs(v)} />
                <YAxis dataKey="month" type="category" tick={{ fontSize: 10, fill: "#71717A" }} width={40} />
                <Tooltip formatter={v => fCrs(v)} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
                <Bar dataKey="demand" fill="#6B21A8" radius={0} name="Total Demand" />
                <Bar dataKey="received" fill="#A78BFA" radius={0} name="Total Received" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 5: Summary Table */}
      <div className="border border-zinc-200 bg-white p-4" data-testid="sales-summary-table">
        <div className="text-sm font-semibold tracking-tight mb-3" style={{ fontFamily: 'var(--font-heading)' }}>SUMMARY</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-y border-zinc-200 bg-zinc-50">
                {["Project", "Total Sales", "Total Demand", "Total Received", "Outstanding"].map(h => (
                  <th key={h} className="text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-400 py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {project_sales.map((r, i) => (
                <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="py-2 px-3 text-xs font-semibold text-zinc-700">{r.project}</td>
                  <td className="py-2 px-3 text-xs text-right font-semibold">{fCrs(r.sales)}</td>
                  <td className="py-2 px-3 text-xs text-right font-semibold">{fCrs(r.demand)}</td>
                  <td className="py-2 px-3 text-xs text-right font-semibold">{fCrs(r.received)}</td>
                  <td className="py-2 px-3 text-xs text-right font-semibold">{fCrs(r.outstanding)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-zinc-300 bg-zinc-50 font-bold">
                <td className="py-2 px-3 text-xs">Total</td>
                <td className="py-2 px-3 text-xs text-right">{fCrs(project_sales.reduce((a, b) => a + b.sales, 0))}</td>
                <td className="py-2 px-3 text-xs text-right">{fCrs(project_sales.reduce((a, b) => a + b.demand, 0))}</td>
                <td className="py-2 px-3 text-xs text-right">{fCrs(project_sales.reduce((a, b) => a + b.received, 0))}</td>
                <td className="py-2 px-3 text-xs text-right">{fCrs(project_sales.reduce((a, b) => a + b.outstanding, 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DonutPanel({ testId, title, data, centerLabel, formatter }) {
  return (
    <div className="border border-zinc-200 bg-white p-4" data-testid={testId}>
      <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-400 mb-2">{title}</div>
      <div style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={58} dataKey="value" stroke="#fff" strokeWidth={2}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip formatter={formatter} contentStyle={{ fontSize: 11, border: "1px solid #E4E4E7", borderRadius: 0 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center text-xs font-bold text-zinc-700 -mt-1">{centerLabel}</div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.map((d, i) => (
          <span key={i} className="flex items-center gap-1 text-[9px] text-zinc-500">
            <span className="w-2 h-2 flex-shrink-0" style={{ background: d.color }}></span>{d.name}
          </span>
        ))}
      </div>
    </div>
  );
}
