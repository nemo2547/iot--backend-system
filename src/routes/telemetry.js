import express from "express";
import { sendToQueue } from "../config/rabbitmq.js";

const router = express.Router();

router.post("/telemetry", async (req, res) => {
  try {
    const { deviceId, voltage, temperature } = req.body;

    // 1. (สมมุติ/บันทึก) บันทึกค่าลง Database...
    console.log(`[DB] Saved telemetry for ${deviceId}`);

    // 2. เช็กเงื่อนไข: หากแรงดันไฟฟ้า (Voltage) พุ่งสูงเกิน 250V
    if (voltage > 250) {
      const alertPayload = {
        deviceId: deviceId || "pico_01",
        voltage,
        time: new Date().toISOString(),
      };

      // 3. Publish ข้อความลง Queue alert_emails
      sendToQueue(alertPayload);
      console.log(`[Producer] Alert published for device ${deviceId} (Voltage: ${voltage}V)`);
    }

    // 4. ตอบกลับ HTTP 200 OK ทันที (Non-blocking)
    return res.status(200).json({
      message: "Telemetry received successfully",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

export default router;