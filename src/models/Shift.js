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

    costSnapshot: {
      fuel: {
        fuelPrice: {
          type: Number,
          default: 0
        },

        kmPerLiter: {
          type: Number,
          default: 0
        },

        costPerKm: {
          type: Number,
          default: 0
        }
      },

      maintenance: {
        oilCostPerKm: {
          type: Number,
          default: 0
        },

        tires: {
          type: Number,
          default: 0
        },

        chainCostPerKm: {
          type: Number,
          default: 0
        },

        totalCostPerKm: {
          type: Number,
          default: 0
        }
      },

      totalCostPerKm: {
        type: Number,
        default: 0
      }
    },

    route: [
      {
        lat: {
          type: Number
        },

        lng: {
          type: Number
        },

        timestamp: {
          type: Date
        }
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