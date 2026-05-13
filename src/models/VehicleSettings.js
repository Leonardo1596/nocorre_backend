import mongoose from "mongoose";

const vehicleSettingsSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
      },

      vehicleType: {
        type: String,
        enum: ["MOTORCYCLE", "CAR"],
        required: true
      },

      kmPerLiter: {
        type: Number,
        required: true
      }
    },
    {
      timestamps: true
    }
  );

const VehicleSettings = mongoose.model(
  "VehicleSettings",
  vehicleSettingsSchema
);

export default VehicleSettings;