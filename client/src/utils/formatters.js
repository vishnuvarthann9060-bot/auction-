export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return "₹0";
  
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2);
    // remove trailing zero if integer e.g. 2.00 -> 2
    const cleanCr = cr.endsWith(".00") ? cr.slice(0, -3) : cr;
    return `₹${cleanCr} Cr`;
  } else if (amount >= 100000) {
    const lakh = (amount / 100000).toFixed(1);
    const cleanLakh = lakh.endsWith(".0") ? lakh.slice(0, -2) : lakh;
    return `₹${cleanLakh} L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function getRoleBadgeClass(role) {
  switch (role) {
    case "Batter":
      return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    case "Bowler":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    case "All-Rounder":
      return "bg-purple-500/20 text-purple-300 border-purple-500/40";
    case "Wicketkeeper":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    default:
      return "bg-slate-500/20 text-slate-300 border-slate-500/40";
  }
}
