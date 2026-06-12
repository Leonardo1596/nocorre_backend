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

  const frontTireCostPerKm =
    maintenanceSettings.maintenance.frontTire.lifespanKm > 0
      ? maintenanceSettings.maintenance.frontTire.price /
        maintenanceSettings.maintenance.frontTire.lifespanKm
      : 0;

  const rearTireCostPerKm =
    maintenanceSettings.maintenance.rearTire.lifespanKm > 0
      ? maintenanceSettings.maintenance.rearTire.price /
        maintenanceSettings.maintenance.rearTire.lifespanKm
      : 0;

  const chainKitCostPerKm =
    maintenanceSettings.maintenance.chain.lifespanKm > 0
      ? maintenanceSettings.maintenance.chain.price /
        maintenanceSettings.maintenance.chain.lifespanKm
      : 0;

  const maintenanceCostPerKm =
    oilCostPerKm +
    frontTireCostPerKm +
    rearTireCostPerKm +
    chainKitCostPerKm;

  const totalCostPerKm =
    fuelCostPerKm + maintenanceCostPerKm;

  return {
    fuel: {
      fuelPrice,
      kmPerLiter,
      costPerKm: Number(fuelCostPerKm.toFixed(4))
    },

    maintenance: {
      oilCostPerKm: Number(
        oilCostPerKm.toFixed(4)
      ),

      frontTireCostPerKm: Number(
        frontTireCostPerKm.toFixed(4)
      ),

      rearTireCostPerKm: Number(
        rearTireCostPerKm.toFixed(4)
      ),

      chainKitCostPerKm: Number(
        chainKitCostPerKm.toFixed(4)
      ),

      totalCostPerKm: Number(
        maintenanceCostPerKm.toFixed(4)
      )
    },

    totalCostPerKm: Number(
      totalCostPerKm.toFixed(4)
    )
  };
}