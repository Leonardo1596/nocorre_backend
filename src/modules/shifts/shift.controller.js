import Shift from "../../models/Shift.js";
import WorkSession from "../../models/WorkSession.js";
import MaintenanceSettings from "../../models/MaintenanceSettings.js";

import { calculateShiftMetrics } from "../../services/metrics/calculateShiftMetrics.js";
import { calculateCostSnapshot } from "../../services/costEngine/caculateCostSnapshot.js";

export async function startShift(req, res) {
  try {
    const activeShift = await Shift.findOne({
      user: req.userId,
      status: "ACTIVE"
    });

    if (activeShift) {
      return res.status(400).json({
        message: "There is already an active shift"
      });
    }

    const maintenanceSettings =
      await MaintenanceSettings.findOne({
        user: req.userId
      });

    if (!maintenanceSettings) {
      return res.status(400).json({
        message: "Maintenance settings not found"
      });
    }

    const costSnapshot = calculateCostSnapshot({
      maintenanceSettings
    });

    const shift = await Shift.create({
      user: req.userId,
      startedAt: new Date(),
      status: "ACTIVE",
      totalKm: 0,
      productiveKm: 0,
      route: [],
      costSnapshot
    });

    return res.status(201).json(shift);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
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