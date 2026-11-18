// The Dock is kept alive while the visible client is closed only when the
// whole process group fits the release budget. app.getAppMetrics() reports
// privateBytes in KiB on Windows, the same WorkingSetPrivate quantity the
// release sampler reads.
const DOCK_BUDGET_KIB = 200 * 1024;

function privateBytes(metrics) {
  if (!Array.isArray(metrics)) return 0;
  let total = 0;
  for (const metric of metrics) {
    const value = Number(metric?.memory?.privateBytes);
    if (Number.isFinite(value) && value > 0) total += value;
  }
  return total;
}

function overBudget(metrics, limit = DOCK_BUDGET_KIB) {
  const bytes = privateBytes(metrics);
  return bytes > limit ? bytes : 0;
}

module.exports = { DOCK_BUDGET_KIB, privateBytes, overBudget };
