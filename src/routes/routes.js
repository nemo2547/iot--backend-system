import { Router } from 'express';
import { prisma, redis } from '../db/db.js';

const router = Router();

// ==========================================
// กิจกรรมที่ 2 & 3: Ingest Telemetry Data
// POST /api/telemetry
// ==========================================
router.post('/telemetry', async (req, res) => {
  try {
    const { device_id, voltage, current } = req.body;

    // Validate Input
    if (!device_id || voltage === undefined || current === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: device_id, voltage, current',
      });
    }

    // 1. บันทึกลง PostgreSQL (กิจกรรมที่ 2)
    const telemetry = await prisma.telemetry.create({
      data: {
        device_id: String(device_id),
        voltage: parseFloat(voltage),
        current: parseFloat(current),
      },
    });

    // 2. อัปเดตข้อมูลล่าสุดลง Redis Cache ทันที (กิจกรรมที่ 3)
    const cacheKey = `device:${device_id}:latest_status`;
    await redis.set(cacheKey, JSON.stringify(telemetry));

    return res.status(201).json({
      success: true,
      message: 'Telemetry saved successfully',
      data: telemetry,
    });
  } catch (error) {
    console.error('Error saving telemetry:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==========================================
// กิจกรรมที่ 3: Get Device Status (Cache-Aside Pattern)
// GET /api/devices/:id/status
// ==========================================
router.get('/devices/:id/status', async (req, res) => {
  try {
    const { id: device_id } = req.params;
    const cacheKey = `device:${device_id}:latest_status`;

    // 1. ค้นหาใน Redis Cache ก่อน (Cache Hit Check)
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log(`[CACHE HIT] Found status for device: ${device_id}`);
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedData),
      });
    }

    // 2. หากไม่พบใน Cache ให้ไปดึงจาก PostgreSQL (Cache Miss)
    console.log(`[CACHE MISS] Fetching status from DB for device: ${device_id}`);
    const latestTelemetry = await prisma.telemetry.findFirst({
      where: { device_id },
      orderBy: { timestamp: 'desc' },
    });

    if (!latestTelemetry) {
      return res.status(404).json({
        success: false,
        message: 'Device telemetry not found',
      });
    }

    // 3. นำข้อมูลที่ดึงได้จาก DB บันทึกลง Redis Cache สำหรับครั้งถัดไป
    await redis.set(cacheKey, JSON.stringify(latestTelemetry));

    return res.json({
      source: 'database',
      data: latestTelemetry,
    });
  } catch (error) {
    console.error('Error fetching device status:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;