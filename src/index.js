import app from './app.js';
import dotenv from 'dotenv';
import { connectRabbitMQ } from './config/rabbitmq.js';

dotenv.config();
connectRabbitMQ();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});