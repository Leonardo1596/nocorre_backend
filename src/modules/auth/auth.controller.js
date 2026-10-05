import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../../models/User.js";
import MaintenanceSettings from "../../models/MaintenanceSettings.js";

export async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      vehicleType
    } = req.body;

    const userAlreadyExists = await User.findOne({
      email
    });

    if (userAlreadyExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const selectedVehicleType = vehicleType || "MOTORCYCLE";

    if (!["MOTORCYCLE", "CAR"].includes(selectedVehicleType)) {
      return res.status(400).json({
        message: "Invalid vehicle type"
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      vehicleType: selectedVehicleType
    });

    const maintenanceItems =
      selectedVehicleType === "MOTORCYCLE"
        ? [
            {
              key: "oil",
              name: "Óleo",
              price: 0,
              lifespanKm: 0,
              isDefault: true
            },
            {
              key: "frontTire",
              name: "Pneu dianteiro",
              price: 0,
              lifespanKm: 0,
              isDefault: true
            },
            {
              key: "rearTire",
              name: "Pneu traseiro",
              price: 0,
              lifespanKm: 0,
              isDefault: true
            },
            {
              key: "chain",
              name: "Kit de transmissão",
              price: 0,
              lifespanKm: 0,
              isDefault: true
            }
          ]
        : [
            {
              key: "oil",
              name: "Óleo",
              price: 0,
              lifespanKm: 0,
              isDefault: true
            },
            {
              key: "tires",
              name: "Pneus",
              price: 0,
              lifespanKm: 0,
              isDefault: true
            }
          ];

    await MaintenanceSettings.create({
      user: user._id,

      fuel: {
        kmPerLiter:
          selectedVehicleType === "MOTORCYCLE"
            ? 30
            : 10,

        fuelPrice: 6.5
      },

      maintenance: maintenanceItems
    });

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        vehicleType: user.vehicleType
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function login(req, res) {
  try {
    const {
      email,
      password
    } = req.body;

    const user = await User.findOne({
      email
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.json({
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        vehicleType: user.vehicleType
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}