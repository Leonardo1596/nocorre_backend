import mongoose from "mongoose";

const workSessionSchema = new mongoose.Schema(
  {
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    startedAt: {
      type: Date,
      required: true
    },

    endedAt: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ["ACTIVE", "FINISHED"],
      default: "ACTIVE"
    },

    grossAmount: {
      type: Number,
      default: 0
    },

    fuelExpense: {
      type: Number,
      default: 0
    },

    foodExpense: {
      type: Number,
      default: 0
    },

    otherExpense: {
      type: Number,
      default: 0
    },

    productiveKm: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const WorkSession = mongoose.model(
  "WorkSession",
  workSessionSchema
);

export default WorkSession;