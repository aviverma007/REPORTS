export function fCr(v) {
  if (!v && v !== 0) return "—";
  const c = v / 1e7;
  if (c >= 1000) return c.toFixed(1) + " Cr";
  if (c >= 100) return c.toFixed(2) + " Cr";
  if (c >= 1) return c.toFixed(2) + " Cr";
  if (v / 1e5 >= 1) return (v / 1e5).toFixed(2) + " L";
  return (v / 1000).toFixed(2) + " K";
}

export function fShort(v) {
  if (!v && v !== 0) return "0";
  const c = v / 1e7;
  if (c >= 100) return c.toFixed(1) + "Cr";
  if (c >= 1) return c.toFixed(2) + "Cr";
  if (v / 1e5 >= 1) return (v / 1e5).toFixed(1) + "L";
  return (v / 1000).toFixed(1) + "K";
}

export const COLORS = {
  budget: "#2563EB",
  ordered: "#D97706",
  delivered: "#059669",
  invoiced: "#7C3AED",
  stillDeliver: "#E11D48",
  stillInvoice: "#B91C1C",
  project: "#2E7DD4",
  nonProject: "#2A9A5E",
  palette: ["#2563EB", "#059669", "#D97706", "#E11D48", "#7C3AED", "#0891B2", "#B45309", "#475569", "#0D9488", "#6D28D9"]
};
