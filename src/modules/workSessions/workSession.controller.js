import Shift from "../../models/Shift.js";
import WorkSession from "../../models/WorkSession.js";
import VehicleSettings from "../../models/VehicleSettings.js";
import FuelRecord from "../../models/FuelRecord.js";
import MaintenanceSettings from "../../models/MaintenanceSettings.js";
import { calculateFuelExpense } from "../../services/metrics/calculateFuelExpense.js";
import { calculateCostPerKm } from "../../services/costEngine/calculateCostPerKm.js";

export async function startWorkSession(req, res) {
  try {
    const { startedAt, timezoneOffset } = req.body;

    if (!startedAt || timezoneOffset === undefined) {
      return res.status(400).json({
        message: "startedAt and timezoneOffset from the client are required."
      });
    }

    const activeShift = await Shift.findOne({
      user: req.userId,
      status: "ACTIVE"
    });

    if (!activeShift) {
      return res.status(400).json({
        message: "No active shift found"
      });
    }

    const activeSession = await WorkSession.findOne({
      user: req.userId,
      status: "ACTIVE"
    });

    if (activeSession) {
      return res.status(400).json({
        message: "There is already an active work session"
      });
    }

    const workSession = await WorkSession.create({
      shift: activeShift._id,
      user: req.userId,
      startedAt: new Date(startedAt)
    });

    return res.status(201).json(workSession);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function pauseWorkSession(req, res) {
  const { id } = req.params;

  const session = await WorkSession.findById(id);

  if (!session) {
    return res.status(404).json({
      message: "Session not found"
    });
  }

  if (session.status !== "ACTIVE") {
    return res.status(400).json({
      message: "Session is not active"
    });
  }

  session.status = "PAUSED";

  session.pauses.push({
    startedAt: new Date()
  });

  await session.save();

  return res.json(session);
}

export async function resumeWorkSession(req, res) {
  const { id } = req.params;

  const session = await WorkSession.findById(id);

  if (!session) {
    return res.status(404).json({
      message: "Session not found"
    });
  }

  if (session.status !== "PAUSED") {
    return res.status(400).json({
      message: "Session is not paused"
    });
  }

  const currentPause = session.pauses[session.pauses.length - 1];

  currentPause.endedAt = new Date();

  const pauseMs = new Date(currentPause.endedAt) - new Date(currentPause.startedAt);

  session.pausedDurationMs += pauseMs;
  session.status = "ACTIVE";

  await session.save();

  return res.json(session);
}

export async function finishWorkSession(req, res) {
  try {
    const { id } = req.params;
    const { grossAmount, foodExpense, otherExpense, productiveKm } = req.body;

    const workSession = await WorkSession.findOne({
      _id: id,
      user: req.userId
    });

    if (!workSession) {
      return res.status(404).json({
        message: "Work session not found"
      });
    }

    const maintenanceSettings = await MaintenanceSettings.findOne({
      user: req.userId
    });

    if (!maintenanceSettings) {
      return res.status(400).json({
        message: "Maintenance settings not found"
      });
    }

    workSession.endedAt = new Date();
    workSession.status = "FINISHED";
    workSession.grossAmount = grossAmount || 0;
    workSession.foodExpense = foodExpense || 0;
    workSession.otherExpense = otherExpense || 0;
    workSession.productiveKm = productiveKm || 0;

    await workSession.save();

    const shift = await Shift.findById(workSession.shift);
    if (shift) {
        shift.productiveKm += productiveKm || 0;
        await shift.save();
    }

    return res.json(workSession);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function getWorkSessions(req, res) {
  try {
    const workSessions = await WorkSession.find({
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

export async function deleteWorkSession(req, res) {
  try {
    const { id } = req.params;
    const workSession = await WorkSession.findOneAndDelete({
      _id: id,
      user: req.userId
    });
    if (!workSession) {
      return res.status(404).json({
        message: "Work session not found"
      });
    }
    return res.json({
      message: "Work session deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function deleteByDate(req, res) {
  try {
    const { date } = req.params;
    const { timezoneOffset } = req.query;

    if (!timezoneOffset) {
      return res.status(400).json({
        message: "The 'timezoneOffset' query parameter is required."
      });
    }

    const offsetMinutes = parseInt(timezoneOffset, 10);
    const parsedDate = new Date(date);
    const startOfDayLocal = new Date(parsedDate.getTime() + (offsetMinutes * 60 * 1000));
    const endOfDayLocal = new Date(startOfDayLocal.getTime() + (24 * 60 * 60 * 1000));

    const result = await WorkSession.deleteMany({
      user: req.userId,
      startedAt: {
        $gte: startOfDayLocal,
        $lt: endOfDayLocal
      }
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "No work sessions found for the specified local date."
      });
    }

    return res.json({
      message: `${result.deletedCount} work session(s) deleted successfully`
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}