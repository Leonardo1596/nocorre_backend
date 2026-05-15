export function calculateCostSnapshot({
  maintenanceSettings
}) {
  const fuelPrice =
    maintenanceSettings.fuel.fuelPrice || 0;

  const kmPerLiter =
    maintenanceSettings.fuel.kmPerLiter || 1;

  const fuelCostPerKm =
    fuelPrice / kmPerLiter;

  const oilCostPerKm =
    maintenanceSettings.maintenance.oil
      .costPerKm || 0;

  const tiresCostPerKm =
    maintenanceSettings.maintenance.tires
      .costPerKm || 0;

  const chainCostPerKm =
    maintenanceSettings.maintenance.chain
      .costPerKm || 0;

  const maintenanceCostPerKm =
    oilCostPerKm +
    tiresCostPerKm +
    chainCostPerKm;

  const totalCostPerKm =
    fuelCostPerKm + maintenanceCostPerKm;

  return {
    fuel: {
      fuelPrice,
      kmPerLiter,
      costPerKm: Number(fuelCostPerKm.toFixed(4))
    },

    maintenance: {
      oilCostPerKm: Number(oilCostPerKm.toFixed(4)),

      tiresCostPerKm: Number(tiresCostPerKm.toFixed(4)),

      chainCostPerKm: Number(chainCostPerKm.toFixed(4)),

      totalCostPerKm: Number(maintenanceCostPerKm.toFixed(4))
    },

    totalCostPerKm: Number(totalCostPerKm.toFixed(4))
  };
}