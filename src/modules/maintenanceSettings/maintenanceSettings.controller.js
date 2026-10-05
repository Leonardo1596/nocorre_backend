import MaintenanceSettings from "../../models/MaintenanceSettings.js";

export async function updateMaintenanceSettings(req, res) {
  try {
    const {
      fuel,
      maintenance
    } = req.body;

    const settings = await MaintenanceSettings.findOne({
      user: req.userId
    });

    if (!settings) {
      return res.status(404).json({
        message: "Settings not found"
      });
    }

    /**
     * FUEL
     */

    if (fuel?.fuelPrice !== undefined) {
      settings.fuel.fuelPrice = fuel.fuelPrice;
    }

    if (fuel?.kmPerLiter !== undefined) {
      settings.fuel.kmPerLiter = fuel.kmPerLiter;
    }

    /**
     * MAINTENANCE
     *
     * Atualiza os itens existentes.
     * O item é identificado pela key.
     */

    if (Array.isArray(maintenance)) {
      for (const item of maintenance) {
        if (!item.key) {
          continue;
        }

        const existingItem = settings.maintenance.find(
          maintenanceItem => maintenanceItem.key === item.key
        );

        if (!existingItem) {
          continue;
        }

        if (item.name !== undefined) {
          existingItem.name = item.name;
        }

        if (item.price !== undefined) {
          existingItem.price = item.price;
        }

        if (item.lifespanKm !== undefined) {
          existingItem.lifespanKm = item.lifespanKm;
        }
      }
    }

    await settings.save();

    return res.json(settings);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function getMaintenanceSettings(req, res) {
  try {
    const settings = await MaintenanceSettings.findOne({
      user: req.userId
    });

    if (!settings) {
      return res.status(404).json({
        message: "Settings not found"
      });
    }

    return res.json(settings);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function addMaintenanceItem(req, res) {
  try {
    const {
      name,
      price,
      lifespanKm
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Maintenance item name is required"
      });
    }

    const settings = await MaintenanceSettings.findOne({
      user: req.userId
    });

    if (!settings) {
      return res.status(404).json({
        message: "Settings not found"
      });
    }

    const key = `custom_${Date.now()}`;

    settings.maintenance.push({
      key,
      name: name.trim(),
      price: price ?? 0,
      lifespanKm: lifespanKm ?? 0,
      isDefault: false
    });

    await settings.save();

    const newItem =
      settings.maintenance[
        settings.maintenance.length - 1
      ];

    return res.status(201).json({
      item: newItem
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function updateMaintenanceItem(req, res) {
  try {
    const {
      itemId
    } = req.params;

    const {
      name,
      price,
      lifespanKm
    } = req.body;

    const settings = await MaintenanceSettings.findOne({
      user: req.userId
    });

    if (!settings) {
      return res.status(404).json({
        message: "Settings not found"
      });
    }

    const item = settings.maintenance.id(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Maintenance item not found"
      });
    }

    /**
     * Itens padrão não podem ter o nome alterado.
     *
     * Eles representam os componentes padrão
     * definidos pelo tipo do veículo.
     */

    if (
      item.isDefault === false &&
      name !== undefined
    ) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Maintenance item name is required"
        });
      }

      item.name = name.trim();
    }

    if (price !== undefined) {
      item.price = price;
    }

    if (lifespanKm !== undefined) {
      item.lifespanKm = lifespanKm;
    }

    await settings.save();

    return res.json({
      item
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}

export async function deleteMaintenanceItem(req, res) {
  try {
    // Pega itemId ou id (garante compatibilidade)
    const itemId = req.params.itemId || req.params.id;

    const settings = await MaintenanceSettings.findOne({
      user: req.userId
    });

    if (!settings) {
      return res.status(404).json({
        message: "Settings not found"
      });
    }

    const item = settings.maintenance.id(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Maintenance item not found"
      });
    }

    if (item.isDefault) {
      return res.status(400).json({
        message: "Default maintenance items cannot be deleted"
      });
    }

    item.deleteOne();
    await settings.save();

    return res.json({
      message: "Maintenance item deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}