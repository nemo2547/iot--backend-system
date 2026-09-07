// seed-bulk.js
import { prisma } from './src/db/db.js';

async function generateBulkData() {
  const TOTAL_RECORDS = 200;
  const BATCH_SIZE = 50; // แบ่ง Insert ทีละ 2,000 records เพื่อป้องกัน Memory เต็ม
  const devices = ['pico-01'];

  console.log(`🚀 Starting bulk insert of ${TOTAL_RECORDS} telemetry records...`);
  const startTime = Date.now();

  for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
    const records = [];
    
    for (let j = 0; j < BATCH_SIZE; j++) {
      const randomDevice = devices[Math.floor(Math.random() * devices.length)];
      const randomVoltage = parseFloat((210 + Math.random() * 20).toFixed(2));
      const randomCurrent = parseFloat((0.5 + Math.random() * 3.5).toFixed(2));
      
      // สุ่มย้อนเวลา timestamp ไปในอดีตเพื่อให้ข้อมูลกระจายตัว
      const randomPastTime = new Date(Date.now() - Math.floor(Math.random() * 1000000000));

      records.push({
        device_id: randomDevice,
        voltage: randomVoltage,
        current: randomCurrent,
        timestamp: randomPastTime,
      });
    }

    // Insert แบบ Bulk ลง PostgreSQL
    await prisma.telemetry.createMany({
      data: records,
    });

    console.log(`⏳ Inserted ${i + BATCH_SIZE} / ${TOTAL_RECORDS} records...`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Bulk insert completed in ${duration} seconds!`);
  
  await prisma.$disconnect();
  process.exit(0);
}

generateBulkData().catch(async (error) => {
  console.error('❌ Error inserting bulk data:', error);
  await prisma.$disconnect();
  process.exit(1);
});