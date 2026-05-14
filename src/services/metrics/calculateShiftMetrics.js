import { calculateCostPerKm } from "../costEngine/calculateCostPerKm.js";

export function calculateShiftMetrics({
  shift,
  workSessions,
  maintenanceSettings
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

  const cost = calculateCostPerKm({
    maintenanceSettings
  });

  const fuelExpense =
    cost.fuelCostPerKm * productiveKm;

  const maintenanceExpense =
    cost.maintenanceCostPerKm * productiveKm;

  const totalExpenses =
    fuelExpense +
    maintenanceExpense +
    foodExpense +
    otherExpense;

  const netProfit =
    grossAmount - totalExpenses;

  /**
   * PRODUCTIVE TIME
   * Total session time - paused time
   */
  const productiveMilliseconds =
    workSessions.reduce((acc, session) => {
      if (!session.startedAt) {
        return acc;
      }

      const endDate =
        session.endedAt || new Date();

      const totalSessionMs =
        new Date(endDate) -
        new Date(session.startedAt);

      const pausedMs =
        session.pausedDurationMs || 0;

      const productiveMs =
        totalSessionMs - pausedMs;

      return acc + productiveMs;
    }, 0);

  const productiveHours =
    productiveMilliseconds /
    (1000 * 60 * 60);

  /**
   * TOTAL SHIFT TIME
   * Includes pauses and idle time
   */
  const totalHours = shift.startedAt
    ? (
        (
          new Date(shift.endedAt || new Date()) -
          new Date(shift.startedAt)
        ) /
        (1000 * 60 * 60)
      )
    : 0;

  /**
   * EFFICIENCY
   */

  // Only productive work time
  const productiveProfitPerHour =
    productiveHours > 0
      ? netProfit / productiveHours
      : 0;

  // Entire shift duration
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
      grossAmount: Number(
        grossAmount.toFixed(2)
      ),

      fuelExpense: Number(
        fuelExpense.toFixed(2)
      ),

      maintenanceExpense: Number(
        maintenanceExpense.toFixed(2)
      ),

      foodExpense: Number(
        foodExpense.toFixed(2)
      ),

      otherExpense: Number(
        otherExpense.toFixed(2)
      ),

      totalExpenses: Number(
        totalExpenses.toFixed(2)
      ),

      netProfit: Number(
        netProfit.toFixed(2)
      )
    },

    distance: {
      productiveKm: Number(
        productiveKm.toFixed(2)
      ),

      productiveHours: Number(
        productiveHours.toFixed(2)
      ),

      totalHours: Number(
        totalHours.toFixed(2)
      )
    },

    efficiency: {
      productiveProfitPerHour: Number(
        productiveProfitPerHour.toFixed(2)
      ),

      totalProfitPerHour: Number(
        totalProfitPerHour.toFixed(2)
      ),

      profitPerKm: Number(
        profitPerKm.toFixed(2)
      ),

      costPerKm: Number(
        cost.totalCostPerKm.toFixed(4)
      )
    }
  };
}