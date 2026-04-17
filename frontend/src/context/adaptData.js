// Adapts DataContext shape -> shape expected by existing chart components

export function adaptKPI(kpi) {
  if (!kpi) return null;
  return {
    // KPIRow fields
    wbs_count:   kpi.wbsCount,
    wbs_proj:    kpi.wbsProj,
    wbs_non:     kpi.wbsNon,
    budget:      kpi.budget,
    budget_proj: kpi.budgetProj,
    budget_non:  kpi.budgetNon,
    po_count:    kpi.poCount,
    po_proj:     kpi.poProj,
    po_non:      kpi.poNon,
    // total / proj / non_proj nested objects for charts
    total: {
      ordered:          kpi.ordGst,
      delivered:        kpi.delGst,
      invoiced:         kpi.invGst,
      still_to_deliver: kpi.stdGst,
      still_to_invoice: kpi.stiGst,
    },
    proj: {
      ordered:          kpi.ordGstProj,
      delivered:        kpi.delGstProj,
      invoiced:         kpi.invGstProj,
      still_to_deliver: kpi.stdGstProj,
      still_to_invoice: kpi.stiGstProj,
    },
    non_proj: {
      ordered:          kpi.ordGstNon,
      delivered:        kpi.delGstNon,
      invoiced:         kpi.invGstNon,
      still_to_deliver: kpi.stdGstNon,
      still_to_invoice: kpi.stiGstNon,
    },
  };
}

export function adaptMonthly(monthly) {
  return (monthly || []).map(m => ({
    year:     parseInt(m.month.split("-")[0]),
    month:    parseInt(m.month.split("-")[1]),
    ord_proj: m.ordProj,
    del_proj: m.delProj,
    ord_non:  m.ordNon,
    del_non:  m.delNon,
  }));
}

export function adaptPlant(plantData) {
  return (plantData || []).map(p => ({
    plant:            p.plant,
    ordered:          p.ordered,
    delivered:        p.delivered,
    still_to_deliver: p.stillDeliver,
  }));
}

export function adaptWbsBudget(wbsBudget) {
  return (wbsBudget || []).map(w => ({
    wbs:        w.wbs,
    budget:     w.budget,
    is_project: w.isProject,
  }));
}

export function adaptYearly(yearly) {
  return (yearly || []).map(y => ({
    year:             y.year,
    ordered:          y.ordered,
    delivered:        y.delivered,
    invoiced:         y.invoiced,
    still_to_deliver: y.stillDeliver,
  }));
}

export function adaptWbsTable(wbsTable) {
  return (wbsTable || []).map(w => ({
    type:             w.isProject ? "Project" : "Non-Project",
    wbs:              w.wbs,
    description:      w.desc,
    budget:           w.budget,
    ordered:          w.ordered,
    delivered:        w.delivered,
    invoiced:         0,
    still_to_deliver: w.stillDeliver,
    still_to_invoice: 0,
  }));
}
