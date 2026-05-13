export function calculateFuelExpense({
  kilometers,
  fuelPrice,
  kmPerLiter
}) {
  const costPerKm =
    fuelPrice / kmPerLiter;

  const fuelExpense =
    kilometers * costPerKm;

  return Number(
    fuelExpense.toFixed(2)
  );
}