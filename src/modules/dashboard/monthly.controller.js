import Shift from "../../models/Shift.js";
import WorkSession from "../../models/WorkSession.js";
import MaintenanceSettings from "../../models/MaintenanceSettings.js";
import { calculateShiftMetrics } from "../../services/metrics/calculateShiftMetrics.js";

function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

  return { start, end };
}

function formatDay(date) {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function getMonthlyDashboard(req, res) {
  try {
    const { start, end } = getMonthRange();

    const shifts = await Shift.find({
      user: req.userId,
      startedAt: { $gte: start, $lte: end }
    });

    const shiftIds = shifts.map(s => s._id);

    const workSessions = await WorkSession.find({
      shift: { $in: shiftIds }
    });

    const maintenanceSettings = await MaintenanceSettings.findOne({
      user: req.userId
    });

    if (!maintenanceSettings) {
      return res.status(400).json({
        message: "Maintenance settings not found"
      });
    }

    const groupedByDay = {};

    for (const shift of shifts) {
      const dayKey = formatDay(shift.startedAt);

      const sessionsOfShift = workSessions.filter(
        s => String(s.shift) === String(shift._id)
      );

      const metrics = calculateShiftMetrics({
        shift,
        workSessions: sessionsOfShift,
        maintenanceSettings
      });

      if (!groupedByDay[dayKey]) {
        groupedByDay[dayKey] = {
          grossAmount: 0,
          netProfit: 0,
          fuelExpense: 0,
          maintenanceExpense: 0,
          foodExpense: 0,
          otherExpense: 0,
          productiveKm: 0,
          productiveHours: 0,
          totalHours: 0
        };
      }

      groupedByDay[dayKey].grossAmount += metrics.financial.grossAmount;
      groupedByDay[dayKey].netProfit += metrics.financial.netProfit;
      groupedByDay[dayKey].fuelExpense += metrics.financial.fuelExpense;
      groupedByDay[dayKey].foodExpense += metrics.financial.foodExpense;
      groupedByDay[dayKey].otherExpense += metrics.financial.otherExpense;

      groupedByDay[dayKey].productiveKm += metrics.distance.productiveKm;
      groupedByDay[dayKey].productiveHours += metrics.distance.productiveHours;
      groupedByDay[dayKey].totalHours += metrics.distance.totalHours;
    }

    return res.json({
      month: start.getMonth() + 1,
      year: start.getFullYear(),
      days: groupedByDay
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}