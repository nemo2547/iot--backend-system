import amqp from "amqplib";

const QUEUE_NAME = "alert_emails";
let channel = null;

export const connectRabbitMQ = async (retries = 5, delay = 5000) => {
  while (retries > 0) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://rabbitmq:5672");
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log("Connected to RabbitMQ successfully!");
      return;
    } catch (error) {
      console.error(`Failed to connect to RabbitMQ: ${error.message}`);
      retries -= 1;
      console.log(`Retrying to connect... (${retries} attempts left)`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  console.error("Could not connect to RabbitMQ after multiple attempts.");
};

// ⚠️ ตรวจสอบบรรทัดนี้: ต้องมีคำว่า export ชัดเจน
export const sendToQueue = (data) => {
  if (!channel) {
    console.error("RabbitMQ channel is not initialized");
    return false;
  }
  const message = Buffer.from(JSON.stringify(data));
  return channel.sendToQueue(QUEUE_NAME, message, { persistent: true });
};