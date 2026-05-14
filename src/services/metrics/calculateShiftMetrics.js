import { calculateCostPerKm } from "../costEngine/calculateCostPerKm.js";

export function calculateShiftMetrics({
  shift,
  workSessions,
  maintenanceSettings
}) {
  const grossAmount = workSessions.reduce(
    (acc, session) => acc + session.grossAmount,
    0
  );

  const productiveKm = workSessions.reduce(
    (acc, session) => acc + session.productiveKm,
    0
  );

  const foodExpense = workSessions.reduce(
    (acc, session) => acc + session.foodExpense,
    0
  );

  const otherExpense = workSessions.reduce(
    (acc, session) => acc + session.otherExpense,
    0
  );

  const cost = calculateCostPerKm({
    maintenanceSettings
  });

  const fuelExpense =
    cost.fuelCostPerKm * productiveKm;

  const maintenanceExpense =
    cost.maintenanceCostPerKm * productiveKm;

  const totalExpenses =
    fuelExpense + maintenanceExpense + foodExpense + otherExpense;

  const grossProfit = grossAmount - totalExpenses;

  const productiveMilliseconds = workSessions.reduce(
    (acc, session) => {
      if (!session.endedAt) return acc;

      return (
        acc +
        (new Date(session.endedAt) -
          new Date(session.startedAt))
      );
    },
    0
  );

  const productiveHours =
    productiveMilliseconds / 1000 / 60 / 60;

  const totalHours = shift.endedAt
    ? (new Date(shift.endedAt) -
      new Date(shift.startedAt)) /
    1000 /
    60 /
    60
    : 0;

  const profitPerHour =
    productiveHours > 0
      ? grossProfit / productiveHours
      : 0;

  const profitPerKm =
    productiveKm > 0
      ? grossProfit / productiveKm
      : 0;

  return {
    financial: {
      grossAmount: Number(grossAmount.toFixed(2)),
      foodExpense: Number(foodExpense.toFixed(2)),
      otherExpense: Number(otherExpense.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      maintenanceExpense: Number(maintenanceExpense.toFixed(2)),
      netProfit: Number(grossProfit.toFixed(2)),
      fuelExpense: Number(fuelExpense.toFixed(2))
    },
    distance: {
      productiveKm: Number(productiveKm.toFixed(2)),
      productiveHours: Number(productiveHours.toFixed(2)),
      totalHours: Number(totalHours.toFixed(2))
    },
    efficiency: {
      profitPerHour: Number(profitPerHour.toFixed(2)),
      profitPerKm: Number(profitPerKm.toFixed(2)),
      costPerKm: Number(cost.totalCostPerKm.toFixed(4))
    }
  };
}