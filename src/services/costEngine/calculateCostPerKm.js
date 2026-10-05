export function calculateCostPerKm({
  maintenanceSettings
}) {
  const fuelPrice =
    maintenanceSettings?.fuel?.fuelPrice || 0;

  const kmPerLiter =
    maintenanceSettings?.fuel?.kmPerLiter || 1;

  const fuelCostPerKm =
    fuelPrice / kmPerLiter;

  const maintenanceItems =
    Array.isArray(
      maintenanceSettings?.maintenance
    )
      ? maintenanceSettings.maintenance
      : [];

  const maintenanceCostPerKm =
    maintenanceItems.reduce(
      (total, item) => {
        if (!item?.lifespanKm || item.lifespanKm <= 0) {
          return total;
        }

        const itemCostPerKm =
          (item.price || 0) /
          item.lifespanKm;

        return total + itemCostPerKm;
      },
      0
    );

  const totalCostPerKm =
    fuelCostPerKm +
    maintenanceCostPerKm;

  return {
    fuelCostPerKm,
    maintenanceCostPerKm,
    totalCostPerKm
  };
}