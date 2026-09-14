import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// 1. GET /api/devices/:id/status (Protected: ล็อกอินแล้วดูได้หมด)
router.get("/devices/:id/status", verifyToken, (req, res) => {
  res.json({
    deviceId: req.params.id,
    telemetry: { temperature: 28.5, humidity: 65, status: "ONLINE" },
    requestedBy: req.user,
  });
});

// 2. POST /api/devices/:id/commands (Protected: ต้องเป็น Admin เท่านั้น!)
router.post("/devices/:id/commands", verifyToken, requireRole("admin"), (req, res) => {
  const { command } = req.body;
  
  res.json({
    message: `Command '${command}' sent to Pi Pico (Device ${req.params.id}) successfully!`,
    executedBy: req.user.userId,
  });
});

export default router;