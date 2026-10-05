import User from "../../models/User.js";

export async function updateVehicleType(req, res) {

  try {

    const { vehicleType } = req.body;

    const user = await User.findByIdAndUpdate(

      req.userId,

      {
        vehicleType
      },

      {
        new: true,
        runValidators: true
      }

    ).select("vehicleType");

    if (!user) {

      return res.status(404).json({
        message: "Usuário não encontrado"
      });

    }

    return res.json({
      vehicleType: user.vehicleType
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });

  }

}

export async function getVehicleType(req, res) {

  try {

    const user = await User.findById(req.userId)
      .select("vehicleType");

    if (!user) {

      return res.status(404).json({
        message: "Usuário não encontrado"
      });

    }

    return res.json({
      vehicleType: user.vehicleType
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });

  }

}