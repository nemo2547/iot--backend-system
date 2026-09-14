import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import deviceRoutes from "./routes/devices.js";
import telemetryRoutes from "./routes/telemetry.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";

dotenv.config();

const app = express();
app.use(express.json());

// Connect RabbitMQ
connectRabbitMQ();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", deviceRoutes);
app.use("/api", telemetryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});