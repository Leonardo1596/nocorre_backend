import MaintenanceSettings from "../../models/MaintenanceSettings.js";

export async function updateMaintenanceSettings(req, res) {
  try {
    const {
      fuelPrice,
      kmPerLiter,
      oil,
      tires,
      chain
    } = req.body;

    const settings = await MaintenanceSettings.findOne({
      user: req.userId
    });

    if (!settings) {
      return res.status(404).json({
        message: "Settings not found"
      });
    }

    if (fuelPrice !== undefined) {
      settings.fuel.fuelPrice = fuelPrice;
    }

    if (kmPerLiter !== undefined) {
      settings.fuel.kmPerLiter = kmPerLiter;
    }

    if (oil) {
      settings.maintenance.oil.price = oil.price;
      settings.maintenance.oil.lifespanKm = oil.lifespanKm;
    }

    if (tires) {
      settings.maintenance.tires.price = tires.price;
      settings.maintenance.tires.lifespanKm = tires.lifespanKm;
    }

    if (chain) {
      settings.maintenance.chain.price = chain.price;
      settings.maintenance.chain.lifespanKm = chain.lifespanKm;
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