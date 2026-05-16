import { calculateCostPerKm } from "../costEngine/calculateCostPerKm.js";

function formatHoursHuman(hours) {
  const totalMinutes = Math.round((hours || 0) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h === 0) return `${m}min`;
  return `${h}h ${m}min`;
}

export function calculateShiftMetrics({
  shift,
  workSessions
}) {
  const grossAmount = workSessions.reduce(
    (acc, session) => acc + (session.grossAmount || 0),
    0
  );

  const productiveKm = workSessions.reduce(
    (acc, session) => acc + (session.productiveKm || 0),
    0
  );

  const foodExpense = workSessions.reduce(
    (acc, session) => acc + (session.foodExpense || 0),
    0
  );

  const otherExpense = workSessions.reduce(
    (acc, session) => acc + (session.otherExpense || 0),
    0
  );

  const cost = shift.costSnapshot;

  const fuelExpense =
    cost.fuel.costPerKm * productiveKm;

  const maintenanceExpense =
    cost.maintenance.totalCostPerKm * productiveKm;

  const totalExpenses =
    fuelExpense +
    maintenanceExpense +
    foodExpense +
    otherExpense;

  const netProfit =
    grossAmount - totalExpenses;

  const productiveMilliseconds =
    workSessions.reduce((acc, session) => {
      if (!session.startedAt) return acc;

      const endDate = session.endedAt || new Date();

      const totalSessionMs =
        new Date(endDate) - new Date(session.startedAt);

      const pausedMs =
        session.pausedDurationMs || 0;

      return acc + (totalSessionMs - pausedMs);
    }, 0);

  const productiveHours =
    productiveMilliseconds / (1000 * 60 * 60);

  const totalHours = shift.startedAt
    ? (new Date(shift.endedAt || new Date()) -
        new Date(shift.startedAt)) /
      (1000 * 60 * 60)
    : 0;

  const productiveProfitPerHour =
    productiveHours > 0
      ? netProfit / productiveHours
      : 0;

  const totalProfitPerHour =
    totalHours > 0
      ? netProfit / totalHours
      : 0;

  const profitPerKm =
    productiveKm > 0
      ? netProfit / productiveKm
      : 0;

  return {
    financial: {
      grossAmount: Number(grossAmount.toFixed(2)),
      fuelExpense: Number(fuelExpense.toFixed(2)),
      maintenanceExpense: Number(maintenanceExpense.toFixed(2)),
      foodExpense: Number(foodExpense.toFixed(2)),
      otherExpense: Number(otherExpense.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2))
    },

    distance: {
      productiveKm: Number(productiveKm.toFixed(2)),
      productiveHours: Number(productiveHours.toFixed(2)),
      productiveHoursHuman: formatHoursHuman(productiveHours),

      totalHours: Number(totalHours.toFixed(2)),
      totalHoursHuman: formatHoursHuman(totalHours)
    },

    efficiency: {
      productiveProfitPerHour: Number(productiveProfitPerHour.toFixed(2)),
      totalProfitPerHour: Number(totalProfitPerHour.toFixed(2)),
      profitPerKm: Number(profitPerKm.toFixed(2)),
      costPerKm: Number(cost.totalCostPerKm.toFixed(4))
    }
  };
}