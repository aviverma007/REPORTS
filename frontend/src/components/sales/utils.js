export function fCrs(v) {
  if (!v && v !== 0) return "—";
  if (Math.abs(v) >= 1) return v.toFixed(2) + " Crs";
  return (v * 100).toFixed(0) + " L";
}

export function fShortCrs(v) {
  if (!v && v !== 0) return "0";
  if (Math.abs(v) >= 1000) return (v / 1000).toFixed(0) + "K Crs";
  if (Math.abs(v) >= 1) return Math.round(v) + " Crs";
  return (v * 100).toFixed(0) + " L";
}

export function fNum(v) {
  if (!v && v !== 0) return "—";
  return Number(v).toLocaleString();
}

export function fSqft(v) {
  if (!v && v !== 0) return "—";
  return Number(Math.round(v)).toLocaleString() + " Sqft";
}

export const COLORS = {
  purple1: "#6B21A8", purple2: "#7C3AED", purple3: "#A78BFA",
  blue1: "#1D4ED8", blue2: "#3B82F6", blue3: "#93C5FD",
  gold: "#CA8A04", gold2: "#EAB308",
  green: "#059669", red: "#DC2626",
  indigo: "#4338CA", orange: "#EA580C",
  palette: ["#6B21A8", "#3B82F6", "#EA580C", "#DC2626", "#EC4899", "#059669", "#CA8A04"]
};
