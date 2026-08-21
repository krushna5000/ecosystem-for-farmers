import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

dotenv.config();

import { jobsRoutes } from "./routes/jobRoute.js";
import { AdminRoute } from "./routes/adminRoute.js";
import { ConnectionRoute } from "./routes/connectionRoute.js";
import teamRoute from './routes/teamRoute.js'
import blogRoutes from "./routes/blogRoute.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(express.json());
app.use(cookieParser());

// CORS (if frontend is separate domain)
app.use(
  cors({
    origin: [
      "https://farmseasy.in",
      "https://www.farmseasy.in",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.send("Server is Running...");
});

app.use("/uploads", express.static("uploads"));

app.use("/api", jobsRoutes);
app.use("/api", AdminRoute);
app.use("/api", ConnectionRoute);
app.use("/api/blogs", blogRoutes);
app.use("/api/team",teamRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
