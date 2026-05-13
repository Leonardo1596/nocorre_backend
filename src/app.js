import express from "express";
import cors from "cors";

import routes from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use(routes);

app.get("/", (req, res) => {
  return res.json({
    message: "API running"
  });
});

export default app;