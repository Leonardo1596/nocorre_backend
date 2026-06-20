import Shift from "../../models/Shift.js";
import WorkSession from "../../models/WorkSession.js";
import { calculateShiftMetrics } from "../../services/metrics/calculateShiftMetrics.js";

function formatHoursHuman(hours) {
  const totalMinutes = Math.round((hours || 0) * 60);

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h === 0) return `${m}min`;

  return `${h}h ${m}min`;
}

export async function getDashboard(req, res) {
  try {
    const { start, end, timezoneOffset } = req.query;

    if (!start || !end || !timezoneOffset) {
      return res.status(400).json({
        message:
          "start, end, and timezoneOffset query parameters are required"
      });
    }

    const offsetMinutes = parseInt(timezoneOffset, 10);

    const startDate = new Date(start);
    const endDate = new Date(end);

    const shifts = await Shift.find({
      user: req.userId,
      startedAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ startedAt: 1 });

    const shiftIds = shifts.map((shift) => shift._id);

    const workSessions = await WorkSession.find({
      shift: { $in: shiftIds }
    });

    const resultByDayMap = {};

    const summary = {
      grossAmount: 0,
      fuelExpense: 0,
      foodExpense: 0,
      otherExpense: 0,
      netProfit: 0,
      totalExpenses: 0,
      maintenanceExpense: 0,

      productiveKm: 0,
      totalKm: 0,

      totalHours: 0,
      productiveHours: 0
    };

    const efficiency = {
      deadKm: 0,
      idleHours: 0,
      deadFuelExpense: 0,
      deadMaintenanceExpense: 0
    };

    for (const shift of shifts) {
      const utcDate = new Date(shift.startedAt);

      const localTime = new Date(
        utcDate.getTime() - offsetMinutes * 60 * 1000
      );

      const dayKey = localTime.toISOString().split("T")[0];

      const dayName = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long"
      }).format(localTime);

      const sessionsOfShift = workSessions.filter(
        (session) =>
          String(session.shift) === String(shift._id)
      );

      const metrics = calculateShiftMetrics({
        shift,
        workSessions: sessionsOfShift
      });

      console.log(metrics)

      if (!resultByDayMap[dayKey]) {
        resultByDayMap[dayKey] = {
          date: dayKey,
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
            totalKm: 0,

            productiveHours: 0,
            totalHours: 0
          }
        };
      }

      // DAILY ACCUMULATION

      resultByDayMap[dayKey].financial.grossAmount +=
        metrics.financial.grossAmount;

      resultByDayMap[dayKey].financial.netProfit +=
        metrics.financial.netProfit;

      resultByDayMap[dayKey].financial.fuelExpense +=
        metrics.financial.fuelExpense;

      resultByDayMap[dayKey].financial.foodExpense +=
        metrics.financial.foodExpense;

      resultByDayMap[dayKey].financial.otherExpense +=
        metrics.financial.otherExpense;

      resultByDayMap[dayKey].financial.totalExpenses +=
        metrics.financial.totalExpenses;

      resultByDayMap[dayKey].distance.productiveKm +=
        metrics.distance.productiveKm;

      resultByDayMap[dayKey].distance.totalKm +=
        metrics.distance.totalKm;

      resultByDayMap[dayKey].distance.productiveHours +=
        metrics.distance.productiveHours;

      resultByDayMap[dayKey].distance.totalHours +=
        metrics.distance.totalHours;

      // SUMMARY ACCUMULATION

      summary.grossAmount +=
        metrics.financial.grossAmount;

      summary.netProfit +=
        metrics.financial.netProfit;

      summary.fuelExpense +=
        metrics.financial.fuelExpense;

      summary.foodExpense +=
        metrics.financial.foodExpense;

      summary.otherExpense +=
        metrics.financial.otherExpense;

      summary.totalExpenses +=
        metrics.financial.totalExpenses;

      summary.maintenanceExpense +=
        metrics.financial.maintenanceExpense;

      summary.productiveKm +=
        metrics.distance.productiveKm;

      summary.totalKm +=
        metrics.distance.totalKm;

      summary.totalHours +=
        metrics.distance.totalHours;

      summary.productiveHours +=
        metrics.distance.productiveHours;

      // EFFICIENCY ACCUMULATION
      efficiency.deadKm +=
        metrics.efficiency.deadKm;

      efficiency.idleHours +=
        metrics.efficiency.idleHours;

      efficiency.deadFuelExpense +=
        metrics.efficiency.deadFuelExpense;

      efficiency.deadMaintenanceExpense +=
        metrics.efficiency.deadMaintenanceExpense;
    }

    const days = Object.values(resultByDayMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    for (const day of days) {
      day.distance.totalHoursHuman =
        formatHoursHuman(day.distance.totalHours);

      day.distance.productiveHoursHuman =
        formatHoursHuman(day.distance.productiveHours);
    }

    const turnProfitPerHour =
      summary.totalHours > 0
        ? summary.netProfit / summary.totalHours
        : 0;

    const profitPerTotalKm =
      summary.totalKm > 0
        ? summary.netProfit / summary.totalKm
        : 0;

    const summaryWithHuman = {
      ...summary,

      productiveKm: Number(
        summary.productiveKm.toFixed(2)
      ),

      totalKm: Number(
        summary.totalKm.toFixed(2)
      ),

      totalHours: Number(
        summary.totalHours.toFixed(2)
      ),

      productiveHours: Number(
        summary.productiveHours.toFixed(2)
      ),

      totalHoursHuman: formatHoursHuman(
        summary.totalHours
      ),

      productiveHoursHuman: formatHoursHuman(
        summary.productiveHours
      ),

      efficiency: {
        deadKm: Number(
          efficiency.deadKm.toFixed(2)
        ),

        idleHours: Number(
          efficiency.idleHours.toFixed(2)
        ),

        idleHoursHuman: formatHoursHuman(
          efficiency.idleHours
        ),

        deadFuelExpense: Number(
          efficiency.deadFuelExpense.toFixed(2)
        ),

        deadMaintenanceExpense: Number(
          efficiency.deadMaintenanceExpense.toFixed(2)
        ),

        turnProfitPerHour: Number(
          turnProfitPerHour.toFixed(2)
        ),

        profitPerTotalKm: Number(
          profitPerTotalKm.toFixed(2)
        )
      }
    };

    return res.json({
      range: {
        start: startDate,
        end: endDate
      },

      summary: summaryWithHuman,

      days
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message
    });
  }
}