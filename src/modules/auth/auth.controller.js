import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import MaintenanceSettings from "../../models/MaintenanceSettings.js";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    await MaintenanceSettings.create({
      user: user._id,

      fuel: {
        kmPerLiter: 30,
        fuelPrice: 6.5
      },

      maintenance: {
        oil: { costPerKm: 0 },
        tires: { costPerKm: 0 },
        chain: { costPerKm: 0 }
      }
    });

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
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
    const { email, password } = req.body;

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
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}