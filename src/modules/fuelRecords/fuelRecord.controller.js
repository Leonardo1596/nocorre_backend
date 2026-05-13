import FuelRecord from "../../models/FuelRecord.js";

export async function createFuelRecord(
  req,
  res
) {
  try {
    const {
      pricePerLiter,
      liters,
      totalAmount
    } = req.body;

    const fuelRecord =
      await FuelRecord.create({
        user: req.userId,

        pricePerLiter,
        liters,
        totalAmount
      });

    return res.status(201).json(
      fuelRecord
    );
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function getFuelRecords(
  req,
  res
) {
  try {
    const fuelRecords =
      await FuelRecord.find({
        user: req.userId
      }).sort({
        createdAt: -1
      });

    return res.json(fuelRecords);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function getLatestFuelRecord(
  req,
  res
) {
  try {
    const fuelRecord =
      await FuelRecord.findOne({
        user: req.userId
      }).sort({
        createdAt: -1
      });

    return res.json(fuelRecord);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}