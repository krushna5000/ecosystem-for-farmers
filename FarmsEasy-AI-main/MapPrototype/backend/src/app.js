import express from "express";
import cors from "cors";
import farmRoutes from "./routes/farm.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/farm", farmRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "OK" });
});

export default app;
