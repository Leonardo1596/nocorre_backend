import MaintenanceSettings from "../../models/MaintenanceSettings.js";

export async function updateMaintenanceSettings(req, res) {
  try {
    const { fuel, maintenance } = req.body;

    const settings = await MaintenanceSettings.findOne({
      user: req.userId
    });

    if (!settings) {
      return res.status(404).json({
        message: "Settings not found"
      });
    }

    /**
     * FUEL
     */
    if (fuel?.fuelPrice !== undefined) {
      settings.fuel.fuelPrice = fuel.fuelPrice;
    }

    if (fuel?.kmPerLiter !== undefined) {
      settings.fuel.kmPerLiter = fuel.kmPerLiter;
    }

    /**
     * MAINTENANCE
     */
    if (maintenance?.oil) {
      settings.maintenance.oil.price = maintenance.oil.price;
      settings.maintenance.oil.lifespanKm = maintenance.oil.lifespanKm;
    }

    if (maintenance?.tires) {
      settings.maintenance.tires.price = maintenance.tires.price;
      settings.maintenance.tires.lifespanKm = maintenance.tires.lifespanKm;
    }

    if (maintenance?.chain) {
      settings.maintenance.chain.price = maintenance.chain.price;
      settings.maintenance.chain.lifespanKm = maintenance.chain.lifespanKm;
    }

    await settings.save();

    return res.json(settings);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function getMaintenanceSettings(req, res) {
  try {
    const settings = await MaintenanceSettings.findOne({
      user: req.userId
    });

    if (!settings) {
      return res.status(404).json({
        message: "Settings not found"
      });
    }

    return res.json(settings);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}