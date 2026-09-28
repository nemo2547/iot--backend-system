import express from 'express';
import authRoutes from './routes/auth.js';
import deviceRoutes from './routes/devices.js';
import telemetryRoutes from './routes/telemetry.js';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', deviceRoutes);
app.use('/api', telemetryRoutes);

export default app;