import { fShort, COLORS } from "./utils";

export default function PlantGauge({ data }) {
  if (!data?.length) return null;
  const colors = [COLORS.project, COLORS.nonProject, COLORS.invoiced, COLORS.stillDeliver, "#5B2A8A", "#0891B2", "#B45309"];

  return (
    <div className="border border-zinc-200 bg-white p-5" data-testid="plant-gauge-panel">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Plant Budget Utilisation</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Ordered / Budget ratio per plant</div>
        </div>
        <span className="text-[8px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-400">GAUGE</span>
      </div>
      <div className="flex flex-col gap-3">
        {data.map((item, i) => (
          <div key={i} data-testid={`gauge-item-${i}`}>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-zinc-500">Plant {item.plant}</span>
              <span className="text-[10px] font-bold text-zinc-700">{item.utilization}% · {fShort(item.ordered)}</span>
            </div>
            <div className="h-[6px] bg-zinc-100 overflow-hidden">
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{ width: `${item.utilization}%`, background: colors[i % colors.length] }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
