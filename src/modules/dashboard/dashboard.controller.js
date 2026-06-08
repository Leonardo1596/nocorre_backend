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
    // MODIFICATION: Accept timezoneOffset from the query
    const { start, end, timezoneOffset } = req.query;

    // MODIFICATION: Validate that timezoneOffset is present
    if (!start || !end || !timezoneOffset) {
      return res.status(400).json({
        message: "start, end, and timezoneOffset query parameters are required"
      });
    }
    
    // MODIFICATION: Parse the offset, which is sent in minutes by the client
    const offsetMinutes = parseInt(timezoneOffset, 10);

    const startDate = new Date(start);
    const endDate = new Date(end);

    const shifts = await Shift.find({
      user: req.userId,
      startedAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ startedAt: 1 }); // MAIS ANTIGO -> MAIS RECENTE

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
      totalKm: 0,
      totalHours: 0,
      productiveHours: 0
    };

    for (const shift of shifts) {
      // MODIFICATION: The original 'date' variable is replaced by the local time calculation
      const utcDate = new Date(shift.startedAt);
      const localTime = new Date(utcDate.getTime() - (offsetMinutes * 60 * 1000));

      // MODIFICATION: The dayKey is now based on the correct localTime
      const dayKey = localTime.toISOString().split("T")[0];

      // MODIFICATION: The dayName is now based on the correct localTime
      const dayName = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long"
      }).format(localTime);

      const sessionsOfShift = workSessions.filter(
        (session) => String(session.shift) === String(shift._id)
      );

      const metrics = calculateShiftMetrics({
        shift,
        workSessions: sessionsOfShift
      });

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

      resultByDayMap[dayKey].distance.productiveHours +=
        metrics.distance.productiveHours;

      resultByDayMap[dayKey].distance.totalHours +=
        metrics.distance.totalHours;

      // SUMMARY ACCUMULATION
      summary.grossAmount += metrics.financial.grossAmount;
      summary.netProfit += metrics.financial.netProfit;
      summary.fuelExpense += metrics.financial.fuelExpense;
      summary.foodExpense += metrics.financial.foodExpense;
      summary.otherExpense += metrics.financial.otherExpense;
      summary.totalExpenses += metrics.financial.totalExpenses;
      summary.maintenanceExpense += metrics.financial.maintenanceExpense;
      summary.totalKm += metrics.distance.productiveKm;
      summary.totalHours += metrics.distance.totalHours;
      summary.productiveHours += metrics.distance.productiveHours;
    }

    // CONVERTE MAP -> ARRAY ORDENADO
    const days = Object.values(resultByDayMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // FORMATA HUMAN READABLE
    for (const day of days) {
      day.distance.totalHoursHuman =
        formatHoursHuman(day.distance.totalHours);

      day.distance.productiveHoursHuman =
        formatHoursHuman(day.distance.productiveHours);
    }

    const summaryWithHuman = {
      ...summary,
      totalHoursHuman: formatHoursHuman(summary.totalHours),
      productiveHoursHuman: formatHoursHuman(summary.productiveHours)
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
    return res.status(500).json({
      message: error.message
    });
  }
}