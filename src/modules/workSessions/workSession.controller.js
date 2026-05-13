import Shift from "../../models/Shift.js";
import WorkSession from "../../models/WorkSession.js";
import VehicleSettings from "../../models/VehicleSettings.js";
import FuelRecord from "../../models/FuelRecord.js";
import { calculateFuelExpense } from "../../services/metrics/calculateFuelExpense.js";

export async function startWorkSession(
  req,
  res
) {
  try {
    const activeShift = await Shift.findOne({
      user: req.userId,
      status: "ACTIVE"
    });

    if (!activeShift) {
      return res.status(400).json({
        message: "No active shift found"
      });
    }

    const activeSession =
      await WorkSession.findOne({
        user: req.userId,
        status: "ACTIVE"
      });

    if (activeSession) {
      return res.status(400).json({
        message:
          "There is already an active work session"
      });
    }

    const workSession =
      await WorkSession.create({
        shift: activeShift._id,
        user: req.userId,
        startedAt: new Date()
      });

    return res.status(201).json(
      workSession
    );
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function finishWorkSession(
  req,
  res
) {
  try {
    const { id } = req.params;

    const {
      grossAmount,
      foodExpense,
      otherExpense,
      productiveKm
    } = req.body;

    const workSession =
      await WorkSession.findOne({
        _id: id,
        user: req.userId
      });

    if (!workSession) {
      return res.status(404).json({
        message: "Work session not found"
      });
    }

    const vehicleSettings =
      await VehicleSettings.findOne({
        user: req.userId
      });

    if (!vehicleSettings) {
      return res.status(400).json({
        message:
          "Vehicle settings not found"
      });
    }

    const latestFuelRecord =
      await FuelRecord.findOne({
        user: req.userId
      }).sort({
        createdAt: -1
      });

    if (!latestFuelRecord) {
      return res.status(400).json({
        message:
          "Fuel record not found"
      });
    }

    const fuelExpense =
      calculateFuelExpense({
        kilometers: productiveKm,

        fuelPrice:
          latestFuelRecord.pricePerLiter,

        kmPerLiter:
          vehicleSettings.kmPerLiter
      });

    workSession.endedAt = new Date();

    workSession.status = "FINISHED";

    workSession.grossAmount =
      grossAmount || 0;

    workSession.foodExpense =
      foodExpense || 0;

    workSession.otherExpense =
      otherExpense || 0;

    workSession.productiveKm =
      productiveKm || 0;

    workSession.fuelExpense =
      fuelExpense;

    await workSession.save();

    const shift = await Shift.findById(
      workSession.shift
    );

    shift.productiveKm += productiveKm;

    await shift.save();

    return res.json(workSession);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function getWorkSessions(
  req,
  res
) {
  try {
    const workSessions =
      await WorkSession.find({
        user: req.userId
      }).sort({
        createdAt: -1
      });

    return res.json(workSessions);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}