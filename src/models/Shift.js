import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
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

    totalKm: {
      type: Number,
      default: 0
    },

    productiveKm: {
      type: Number,
      default: 0
    },

    route: [
      {
        lat: Number,
        lng: Number,
        timestamp: Date
      }
    ]
  },
  {
    timestamps: true
  }
);

const Shift = mongoose.model(
  "Shift",
  shiftSchema
);

export default Shift;