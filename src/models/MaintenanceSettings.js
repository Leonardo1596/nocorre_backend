import mongoose from "mongoose";

const maintenanceSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    fuel: {
      kmPerLiter: {
        type: Number,
        required: true
      },
      fuelPrice: {
        type: Number,
        required: true
      }
    },

    maintenance: {
      oil: {
        price: {
          type: Number,
          default: 0
        },
        lifespanKm: {
          type: Number,
          default: 0
        }
      },

      tires: {
        price: {
          type: Number,
          default: 0
        },
        lifespanKm: {
          type: Number,
          default: 0
        }
      },

      chain: {
        price: {
          type: Number,
          default: 0
        },
        lifespanKm: {
          type: Number,
          default: 0
        }
      }
    }
  },
  {
    timestamps: true
  }
);

const MaintenanceSettings = mongoose.model(
  "MaintenanceSettings",
  maintenanceSettingsSchema
);

export default MaintenanceSettings;