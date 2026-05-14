export function calculateCostPerKm({
  maintenanceSettings
}) {
  const fuelCostPerKm =
    maintenanceSettings.fuel.fuelPrice /
    maintenanceSettings.fuel.kmPerLiter;

  const oilCostPerKm =
    maintenanceSettings.maintenance.oil.costPerKm || 0;

  const tiresCostPerKm =
    maintenanceSettings.maintenance.tires.costPerKm || 0;

  const chainCostPerKm =
    maintenanceSettings.maintenance.chain.costPerKm || 0;

  const maintenanceCostPerKm =
    oilCostPerKm + tiresCostPerKm + chainCostPerKm;

  const totalCostPerKm =
    fuelCostPerKm + maintenanceCostPerKm;

  return {
    fuelCostPerKm,
    maintenanceCostPerKm,
    totalCostPerKm
  };
}