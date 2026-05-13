import VehicleSettings from "../../models/VehicleSettings.js";

export async function createOrUpdateVehicleSettings(
  req,
  res
) {
  try {
    const {
      vehicleType,
      kmPerLiter
    } = req.body;

    const vehicleSettings =
      await VehicleSettings.findOneAndUpdate(
        {
          user: req.userId
        },
        {
          vehicleType,
          kmPerLiter
        },
        {
          new: true,
          upsert: true
        }
      );

    return res.json(vehicleSettings);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function getVehicleSettings(
  req,
  res
) {
  try {
    const vehicleSettings =
      await VehicleSettings.findOne({
        user: req.userId
      });

    return res.json(vehicleSettings);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}