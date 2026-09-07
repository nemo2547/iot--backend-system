# ⚡ IoT Backend System (Node.js + PostgreSQL + Redis)

ระบบ Backend ประสิทธิภาพสูงสำหรับการรับและจัดการข้อมูล Telemetry จากอุปกรณ์ IoT โดยประยุกต์ใช้ **Cache-Aside Pattern** ร่วมกับ Redis เพื่อลด Latency และลดภาระการทำงานของ PostgreSQL Database

---

## 📋 Prerequisites (สิ่งที่ต้องมีในเครื่อง)

* **Node.js**: เวอร์ชัน 18.x ขึ้นไป ([ดาวน์โหลด](https://nodejs.org/))
* **Docker Desktop**: สำหรับรัน PostgreSQL และ Redis ([ดาวน์โหลด](https://www.docker.com/products/docker-desktop/))
wsl --install 
* **Postman**: สำหรับยิงทดสอบ API ([ดาวน์โหลด](https://www.postman.com/))

---

## ⚙️ Environment Setup (.env)

สร้างไฟล์ `.env` ไว้ที่ Root ของโปรเจกต์ และระบุค่าดังนี้:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/iot_db?schema=public"
REDIS_HOST="localhost"
REDIS_PORT=6379


# ติดตั้ง dependencies ทั้งหมด
npm install

# เริ่มการทำงานของ PostgreSQL และ Redis Container
docker-compose up -d

# อัปเดต Schema และสร้างตารางใน PostgreSQL ด้วย Prisma
npx prisma db push


# รัน Main API Server (http://localhost:3000)
node src/index.js

# เปิด Prisma Studio ดูข้อมูลใน Database ผ่าน Web Browser (http://localhost:5555)
npx prisma studio

# ยิงสร้างข้อมูลจำลองแบบ Bulk (10,000 Records) ลง PostgreSQL
node seed-bulk.js

# ลบ Cache ใน Redis เพื่อบังคับให้เกิด Cache Miss (ผ่าน Node.js Script)
node clear-cache.js

# ลบ Key ใน Redis ตรงๆ ผ่าน Docker CLI
docker exec -it iot--backend-system-redis-1 redis-cli DEL device:pico-01:latest_status

# ยกเลิกการสั่งติดตามโฟลเดอร์ node_modules บน Git
git rm -r --cached node_modules

# Save และ Push ขึ้น Git Repository
git add .
git commit -m "docs: update comprehensive readme"
git push

📡 API Reference
1. Ingest Telemetry Data
Endpoint: POST /api/telemetry

Headers: Content-Type: application/json

Body:
{
  "device_id": "pico-01",
  "voltage": 220.5,
  "current": 1.8
}

2. Get Latest Device Status (Cache-Aside)
Endpoint: GET /api/devices/:id/status

Example: http://localhost:3000/api/devices/pico-01/status