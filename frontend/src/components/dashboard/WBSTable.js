import { fCr } from "./utils";

export default function WBSTable({ data }) {
  if (!data?.length) return null;

  return (
    <div className="border border-zinc-200 bg-white p-5" data-testid="wbs-table-panel">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>WBS Summary — Ordered · Delivered · Invoiced · Still to Deliver with GST</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Top 25 WBS by Ordered Value · colour tagged by project type</div>
        </div>
        <span className="text-[8px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-400">TABLE</span>
      </div>
      <div className="overflow-x-auto max-h-[280px] overflow-y-auto" data-testid="wbs-table-scroll">
        <table className="w-full text-left">
          <thead>
            <tr className="border-y border-zinc-200 bg-zinc-50">
              {["Type", "WBS", "Description", "Budget (Cr)", "Ordered (Cr)", "Delivered (Cr)", "Invoiced (Cr)", "Still to Deliver (Cr)", "Still to Invoice (Cr)"].map(h => (
                <th key={h} className="text-[9px] font-bold tracking-[0.1em] uppercase text-zinc-400 py-2.5 px-3 whitespace-nowrap sticky top-0 bg-zinc-50">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors" data-testid={`wbs-table-row-${i}`}>
                <td className="py-2 px-3">
                  <span className={`inline-flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 ${
                    row.type === 'Project' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {row.type === 'Project' ? 'P' : 'N'}
                  </span>
                </td>
                <td className="py-2 px-3 text-[11px] text-zinc-600 whitespace-nowrap font-medium">{row.wbs}</td>
                <td className="py-2 px-3 text-[11px] text-zinc-500 max-w-[160px] truncate">{row.description}</td>
                <td className="py-2 px-3 text-[11px] text-zinc-800 font-semibold text-right whitespace-nowrap">{fCr(row.budget)}</td>
                <td className="py-2 px-3 text-[11px] text-zinc-800 font-semibold text-right whitespace-nowrap">{fCr(row.ordered)}</td>
                <td className="py-2 px-3 text-[11px] text-zinc-800 font-semibold text-right whitespace-nowrap">{fCr(row.delivered)}</td>
                <td className="py-2 px-3 text-[11px] text-zinc-800 font-semibold text-right whitespace-nowrap">{fCr(row.invoiced)}</td>
                <td className="py-2 px-3 text-[11px] text-zinc-800 font-semibold text-right whitespace-nowrap">{fCr(row.still_to_deliver)}</td>
                <td className="py-2 px-3 text-[11px] text-zinc-800 font-semibold text-right whitespace-nowrap">{fCr(row.still_to_invoice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
