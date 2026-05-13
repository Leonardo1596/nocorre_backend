import mongoose from "mongoose";

const fuelRecordSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      pricePerLiter: {
        type: Number,
        required: true
      },

      liters: {
        type: Number,
        required: true
      },

      totalAmount: {
        type: Number,
        required: true
      }
    },
    {
      timestamps: true
    }
  );

const FuelRecord = mongoose.model(
  "FuelRecord",
  fuelRecordSchema
);

export default FuelRecord;