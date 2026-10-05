export function calculateCostSnapshot({
  maintenanceSettings
}) {
  const fuelPrice =
    maintenanceSettings?.fuel?.fuelPrice || 0;

  const kmPerLiter =
    maintenanceSettings?.fuel?.kmPerLiter || 1;

  const fuelCostPerKm =
    fuelPrice / kmPerLiter;

  /**
   * MAINTENANCE
   *
   * Cada item possui:
   *
   * price
   * lifespanKm
   *
   * O custo por km é:
   *
   * price / lifespanKm
   */

  const maintenanceItems =
    Array.isArray(maintenanceSettings?.maintenance)
      ? maintenanceSettings.maintenance
      : [];

  const maintenanceCosts = maintenanceItems.map(
    (item) => {
      const costPerKm =
        item.lifespanKm > 0
          ? item.price / item.lifespanKm
          : 0;

      return {
        key: item.key,
        name: item.name,
        price: item.price || 0,
        lifespanKm: item.lifespanKm || 0,
        costPerKm: Number(
          costPerKm.toFixed(4)
        )
      };
    }
  );

  const maintenanceCostPerKm =
    maintenanceCosts.reduce(
      (total, item) =>
        total + item.costPerKm,
      0
    );

  const totalCostPerKm =
    fuelCostPerKm + maintenanceCostPerKm;

  return {
    fuel: {
      fuelPrice,
      kmPerLiter,
      costPerKm: Number(
        fuelCostPerKm.toFixed(4)
      )
    },

    maintenance: {
      items: maintenanceCosts,

      totalCostPerKm: Number(
        maintenanceCostPerKm.toFixed(4)
      )
    },

    totalCostPerKm: Number(
      totalCostPerKm.toFixed(4)
    )
  };
}