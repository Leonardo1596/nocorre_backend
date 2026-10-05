import mongoose from "mongoose";

const maintenanceItemSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    price: {
      type: Number,
      default: 0,
      min: 0
    },

    lifespanKm: {
      type: Number,
      default: 0,
      min: 0
    },

    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    _id: true
  }
);

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
        required: true,
        min: 0
      },

      fuelPrice: {
        type: Number,
        required: true,
        min: 0
      }
    },

    maintenance: {
      type: [maintenanceItemSchema],
      default: []
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