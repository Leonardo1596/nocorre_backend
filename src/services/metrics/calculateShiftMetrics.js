export function calculateShiftMetrics({
  shift,
  workSessions
}) {
  const grossAmount =
    workSessions.reduce(
      (acc, session) =>
        acc + session.grossAmount,
      0
    );

  const fuelExpense =
    workSessions.reduce(
      (acc, session) =>
        acc + session.fuelExpense,
      0
    );

  const foodExpense =
    workSessions.reduce(
      (acc, session) =>
        acc + session.foodExpense,
      0
    );

  const otherExpense =
    workSessions.reduce(
      (acc, session) =>
        acc + session.otherExpense,
      0
    );

  const totalExpenses =
    fuelExpense +
    foodExpense +
    otherExpense;

  const netProfit =
    grossAmount - totalExpenses;

  const productiveKm =
    workSessions.reduce(
      (acc, session) =>
        acc + session.productiveKm,
      0
    );

  const productiveMilliseconds =
    workSessions.reduce(
      (acc, session) => {
        if (!session.endedAt)
          return acc;

        return (
          acc +
          (new Date(session.endedAt) -
            new Date(session.startedAt))
        );
      },
      0
    );

  const productiveHours =
    productiveMilliseconds /
    1000 /
    60 /
    60;

  const totalHours =
    shift.endedAt
      ? (new Date(shift.endedAt) -
          new Date(shift.startedAt)) /
        1000 /
        60 /
        60
      : 0;

  const profitPerHour =
    productiveHours > 0
      ? netProfit / productiveHours
      : 0;

  const profitPerKm =
    productiveKm > 0
      ? netProfit / productiveKm
      : 0;

  return {
    grossAmount:
      Number(grossAmount.toFixed(2)),

    fuelExpense:
      Number(fuelExpense.toFixed(2)),

    foodExpense:
      Number(foodExpense.toFixed(2)),

    otherExpense:
      Number(otherExpense.toFixed(2)),

    totalExpenses:
      Number(totalExpenses.toFixed(2)),

    netProfit:
      Number(netProfit.toFixed(2)),

    productiveKm:
      Number(productiveKm.toFixed(2)),

    productiveHours:
      Number(productiveHours.toFixed(2)),

    totalHours:
      Number(totalHours.toFixed(2)),

    profitPerHour:
      Number(profitPerHour.toFixed(2)),

    profitPerKm:
      Number(profitPerKm.toFixed(2))
  };
}