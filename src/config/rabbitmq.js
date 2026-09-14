import amqp from "amqplib";

const QUEUE_NAME = "alert_emails";
let channel = null;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost:5672");
    channel = await connection.createChannel();
    // ประกาศสร้าง Queue ชื่อ alert_emails (durable: true เพื่อไม่ให้คิวหายเมื่อ restart)
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log("Connected to RabbitMQ successfully!");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error.message);
  }
};

export const sendToQueue = (data) => {
  if (!channel) {
    console.error("RabbitMQ channel is not initialized");
    return false;
  }
  // ส่งข้อมูลเข้า Queue โดยแปลง Object เป็น Buffer
  const message = Buffer.from(JSON.stringify(data));
  return channel.sendToQueue(QUEUE_NAME, message, { persistent: true });
};