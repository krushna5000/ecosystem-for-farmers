import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import farmRoutes from "./routes/farm.routes.js";
import weatherRoutes from "./routes/weather.routes.js";
import cropRoutes from "./routes/crop.routes.js";
import agronomyRoutes from "./routes/agronomy.routes.js";
import connectDB from "./config/mongo.db.js";
import indexRoutes from "./routes/index.routes.js";
import stressRoutes from "./routes/stress.routes.js";
import { startWeatherCron } from "./services/weatherCronService.js";
import whatsappCropRoutes from "./routes/whatsapp/crop.routes.js";
import whatsappAuthRoutes from "./routes/whatsapp/auth.routes.js";
import whatsappFarmRoutes from "./routes/whatsapp/farm.routes.js";
import cropAdvisoryRoutes from "./routes/cropAdvisory.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://zeocrop.farmseasy.in",
      "https://psvfl5d8-5173.inc1.devtunnels.ms/",
    ],
    credentials: true,
  }),
);

await connectDB();

// Start weather cron job
startWeatherCron();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/whatsapp", whatsappCropRoutes);
app.use("/api/whatsapp-auth", whatsappAuthRoutes);
app.use("/api/whatsapp-farm", whatsappFarmRoutes);
app.use("/api/crop-ai", cropRoutes);
app.use("/api/CLSM", agronomyRoutes);

app.use("/api/crop-advisory", cropAdvisoryRoutes);

app.use("/api", indexRoutes);
app.use("/api", stressRoutes);

app.get("/", (req, res) => res.send("Server is running"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
