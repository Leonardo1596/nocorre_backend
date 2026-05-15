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
    maintenanceSettings.maintenance.oil.lifespanKm > 0
      ? maintenanceSettings.maintenance.oil.price /
        maintenanceSettings.maintenance.oil.lifespanKm
      : 0;

  const tiresCostPerKm =
    maintenanceSettings.maintenance.tires.lifespanKm > 0
      ? maintenanceSettings.maintenance.tires.price /
        maintenanceSettings.maintenance.tires.lifespanKm
      : 0;

  const chainCostPerKm =
    maintenanceSettings.maintenance.chain.lifespanKm > 0
      ? maintenanceSettings.maintenance.chain.price /
        maintenanceSettings.maintenance.chain.lifespanKm
      : 0;

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