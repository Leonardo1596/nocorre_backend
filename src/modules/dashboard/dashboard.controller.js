import Shift from "../../models/Shift.js";
import WorkSession from "../../models/WorkSession.js";
import MaintenanceSettings from "../../models/MaintenanceSettings.js";

import { calculateShiftMetrics } from "../../services/metrics/calculateShiftMetrics.js";

export async function getDashboard(req, res) {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        message: "start and end dates are required"
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const shifts = await Shift.find({
      user: req.userId,
      startedAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    const shiftIds = shifts.map(shift => shift._id);

    const workSessions = await WorkSession.find({
      shift: { $in: shiftIds }
    });

    const maintenanceSettings =
      await MaintenanceSettings.findOne({
        user: req.userId
      });

    if (!maintenanceSettings) {
      return res.status(400).json({
        message: "Maintenance settings not found"
      });
    }

    const resultByDay = {};

    const summary = {
      grossAmount: 0,
      fuelExpense: 0,
      foodExpense: 0,
      otherExpense: 0,
      netProfit: 0,
      totalExpenses: 0,
      maintenanceExpense: 0,
      totalKm: 0,
      totalHours: 0
    };

    for (const shift of shifts) {
      const date = new Date(shift.startedAt);

      const dayKey = date.toISOString().split("T")[0];

      const dayName = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long"
      }).format(date);

      const sessionsOfShift = workSessions.filter(
        session =>
          String(session.shift) === String(shift._id)
      );

      const metrics = calculateShiftMetrics({
        shift,
        workSessions: sessionsOfShift,
        maintenanceSettings
      });

      if (!resultByDay[dayKey]) {
        resultByDay[dayKey] = {
          dayName,
          financial: {
            grossAmount: 0,
            netProfit: 0,
            fuelExpense: 0,
            foodExpense: 0,
            otherExpense: 0,
            totalExpenses: 0
          },
          distance: {
            productiveKm: 0,
            productiveHours: 0,
            totalHours: 0
          }
        };
      }

      resultByDay[dayKey].financial.grossAmount +=
        metrics.financial.grossAmount;

      resultByDay[dayKey].financial.netProfit +=
        metrics.financial.netProfit;

      resultByDay[dayKey].financial.fuelExpense +=
        metrics.financial.fuelExpense;

      resultByDay[dayKey].financial.foodExpense +=
        metrics.financial.foodExpense;

      resultByDay[dayKey].financial.otherExpense +=
        metrics.financial.otherExpense;

      resultByDay[dayKey].financial.totalExpenses +=
        metrics.financial.totalExpenses;

      resultByDay[dayKey].distance.productiveKm +=
        metrics.distance.productiveKm;

      resultByDay[dayKey].distance.productiveHours +=
        metrics.distance.productiveHours;

      resultByDay[dayKey].distance.totalHours +=
        metrics.distance.totalHours;

      summary.grossAmount += metrics.financial.grossAmount;
      summary.netProfit += metrics.financial.netProfit;
      summary.fuelExpense += metrics.financial.fuelExpense;
      summary.foodExpense += metrics.financial.foodExpense;
      summary.otherExpense += metrics.financial.otherExpense;
      summary.totalExpenses += metrics.financial.totalExpenses;
      summary.maintenanceExpense += metrics.financial.maintenanceExpense;
      summary.totalKm += metrics.distance.productiveKm;
      summary.totalHours += metrics.distance.productiveHours;
    }

    return res.json({
      range: {
        start: startDate,
        end: endDate
      },
      summary,
      days: resultByDay
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}