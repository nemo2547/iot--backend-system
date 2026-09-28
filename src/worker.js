import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const QUEUE_NAME = "alert_emails";

const startWorker = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost:5672");
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // กำหนดให้ Worker รับงานทีละ 1 ชิ้น (ช่วยกระจายงานแบบ Round-robin สมบูรณ์แบบ)
    channel.prefetch(1);

    console.log(`[*] Worker started. Waiting for messages in queue: ${QUEUE_NAME}...`);

    // สั่งให้ Channel ทำการ Consume (รอรับข้อมูล)
    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const content = JSON.parse(msg.content.toString());
          
          console.log(`[x] Received Alert from Device: ${content.deviceId} (Voltage: ${content.voltage}V)`);
          console.log(`    Sending email to admin...`);

          // จำลองความหน่วงของการส่งอีเมล (SMTP) 3 วินาที
          await new Promise((resolve) => setTimeout(resolve, 3000));

          console.log(`[v] Email sent successfully for ${content.deviceId}!`);

          // ส่งคำสั่ง Acknowledge (ACK) บอก RabbitMQ ว่าทำเสร็จแล้ว ลบงานออกจากคิวได้
          channel.ack(msg);
        }
      },
      { noAck: false } // ปิด noAck เพื่อเปิดใช้งาน Manual Acknowledge (ACK)
    );
  } catch (error) {
    console.error("Worker Error:", error);
  }
};

startWorker();