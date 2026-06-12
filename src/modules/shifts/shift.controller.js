import Shift from "../../models/Shift.js";
import WorkSession from "../../models/WorkSession.js";
import MaintenanceSettings from "../../models/MaintenanceSettings.js";

import { calculateShiftMetrics } from "../../services/metrics/calculateShiftMetrics.js";
import { calculateCostSnapshot } from "../../services/costEngine/caculateCostSnapshot.js";

export async function startShift(req, res) {
  try {
    const activeShift = await Shift.findOne({ user: req.userId, status: "ACTIVE" });
    if (activeShift) {
      return res.status(400).json({ message: "There is already an active shift" });
    }

    const maintenanceSettings = await MaintenanceSettings.findOne({ user: req.userId });
    if (!maintenanceSettings) {
      return res.status(400).json({ message: "Maintenance settings not found" });
    }

    const costSnapshot = calculateCostSnapshot({ maintenanceSettings });

    // The frontend now sends startedAt (ISO string) and timezoneOffset (minutes)
    const { startedAt, timezoneOffset } = req.body;

    // Add validation for the new required fields
    if (!startedAt || timezoneOffset === undefined) {
      return res.status(400).json({
        message: "startedAt and timezoneOffset from the client are required."
      });
    }

    // The startedAt is already a UTC ISO string. new Date() will parse it correctly.
    const shiftDate = new Date(startedAt);

    const shift = await Shift.create({
      user: req.userId,
      startedAt: shiftDate,
      status: "ACTIVE",
      totalKm: 0,
      productiveKm: 0,
      route: [],
      costSnapshot
    });

    return res.status(201).json(shift);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

export async function finishShift(req, res) {
  try {
    const { id } = req.params;

    const { totalKm } = req.body;

    const shift = await Shift.findOne({
      _id: id,
      user: req.userId
    });

    if (!shift) {
      return res.status(404).json({
        message: "Shift not found"
      });
    }

    shift.endedAt = new Date();
    shift.status = "FINISHED";
    shift.totalKm = totalKm;
    await shift.save();

    return res.json(shift);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function getShifts(req, res) {
  try {
    const shifts = await Shift.find({
      user: req.userId
    }).sort({
      createdAt: -1
    });

    return res.json(shifts);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function getShift(req, res) {
  try {
    const { id } = req.params;

    const shift = await Shift.findOne({
      _id: id,
      user: req.userId
    });

    if (!shift) {
      return res.status(404).json({
        message: "Shift not found"
      });
    }

    return res.json(shift);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function getShiftMetrics(req, res) {
  try {
    const { id } = req.params;

    const shift = await Shift.findOne({
      _id: id,
      user: req.userId
    });

    if (!shift) {
      return res.status(404).json({
        message: "Shift not found"
      });
    }

    const workSessions = await WorkSession.find({
      shift: shift._id
    });

    const metrics = calculateShiftMetrics({
      shift,
      workSessions
    });

    return res.json(metrics);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function deleteShift(req, res) {
  try {
    const { id } = req.params;

    const shift = await Shift.findOne({
      _id: id,
      user: req.userId
    });

    if (!shift) {
      return res.status(404).json({
        message: "Shift not found"
      });
    }

    await Shift.deleteOne({
      _id: id,
      user: req.userId
    });

    return res.json({
      message: "Shift deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function deleteByDate(req, res) {
  try {
    // MODIFICATION: Accept timezoneOffset from the query string
    const { date } = req.params;
    const { timezoneOffset } = req.query;

    // MODIFICATION: Validate that timezoneOffset is provided
    if (!timezoneOffset) {
      return res.status(400).json({
        message: "The 'timezoneOffset' query parameter is required."
      });
    }

    const offsetMinutes = parseInt(timezoneOffset, 10);
    const parsedDate = new Date(date); // e.g., creates a date for "2026-06-07T00:00:00.000Z"

    // MODIFICATION: Define the 24-hour window based on the user's local day, but in UTC.
    // For "2026-06-07" and a -180 offset (Brazil), this creates a start date of:
    // 2026-06-07T00:00:00.000Z + 180 minutes = 2026-06-07T03:00:00.000Z
    const startOfDayLocal = new Date(parsedDate.getTime() + (offsetMinutes * 60 * 1000));

    // And an end date of:
    // 2026-06-08T03:00:00.000Z
    const endOfDayLocal = new Date(startOfDayLocal.getTime() + (24 * 60 * 60 * 1000));

    // This query will now correctly find the shift at 2026-06-08T02:10:00Z
    // because it falls between 2026-06-07T03:00:00Z and 2026-06-08T03:00:00Z.
    const shift = await Shift.findOne({
      user: req.userId,
      startedAt: {
        $gte: startOfDayLocal,
        $lt: endOfDayLocal
      }
    });

    if (!shift) {
      return res.status(404).json({
        message: "Shift not found for the specified local date."
      });
    }

    await Shift.deleteOne({
      _id: shift._id,
      user: req.userId
    });

    // Also delete associated work sessions for a complete cleanup
    await WorkSession.deleteMany({
      shift: shift._id
    });

    return res.json({
      message: "Shift and associated sessions deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}