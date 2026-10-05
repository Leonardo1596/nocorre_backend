import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI não encontrada no .env");
}

await mongoose.connect(MONGO_URI);

console.log("Conectado ao MongoDB Atlas");

const collection = mongoose.connection.db.collection(
  "maintenancesettings"
);

// Busca somente documentos que ainda possuem
// maintenance no formato antigo (objeto).
const documents = await collection
  .find({
    maintenance: {
      $type: "object"
    }
  })
  .toArray();

console.log(
  `Documentos ainda não migrados: ${documents.length}`
);

for (const doc of documents) {
  const oldMaintenance = doc.maintenance;

  const newMaintenance = [
    {
      key: "oil",
      name: "Óleo",
      price: oldMaintenance?.oil?.price ?? 0,
      lifespanKm: oldMaintenance?.oil?.lifespanKm ?? 0,
      isDefault: true
    },
    {
      key: "frontTire",
      name: "Pneu dianteiro",
      price: oldMaintenance?.frontTire?.price ?? 0,
      lifespanKm: oldMaintenance?.frontTire?.lifespanKm ?? 0,
      isDefault: true
    },
    {
      key: "rearTire",
      name: "Pneu traseiro",
      price: oldMaintenance?.rearTire?.price ?? 0,
      lifespanKm: oldMaintenance?.rearTire?.lifespanKm ?? 0,
      isDefault: true
    },
    {
      key: "chain",
      name: "Kit de transmissão",
      price: oldMaintenance?.chain?.price ?? 0,
      lifespanKm: oldMaintenance?.chain?.lifespanKm ?? 0,
      isDefault: true
    }
  ];

  const result = await collection.updateOne(
    {
      _id: doc._id
    },
    {
      $set: {
        maintenance: newMaintenance
      }
    }
  );

  console.log(
    `Documento ${doc._id}:`,
    `matched=${result.matchedCount}`,
    `modified=${result.modifiedCount}`
  );
}

const oldFormatCount = await collection.countDocuments({
  maintenance: {
    $type: "object"
  }
});

const newFormatCount = await collection.countDocuments({
  maintenance: {
    $type: "array"
  }
});

console.log("");
console.log("===== RESULTADO =====");
console.log(`Formato antigo: ${oldFormatCount}`);
console.log(`Formato novo:   ${newFormatCount}`);

await mongoose.disconnect();

console.log("Desconectado do MongoDB Atlas");