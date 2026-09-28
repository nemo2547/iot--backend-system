import request from 'supertest';
import app from '../src/app.js';

describe('API Integration Tests - Security Middleware', () => {

  // เคส 1 (No Token): สั่งให้ยิง Request เปล่าๆ โดยไม่แนบ Header Authorization
  test('POST /api/devices/1/commands without token should return 401 Unauthorized', async () => {
    const response = await request(app)
      .post('/api/devices/1/commands')
      .send({ command: 'RESET' });

    expect(response.status).toBe(401);
  });

  // เคส 2 (Invalid Token): จำลองการสร้าง Token ปลอมแนบไป
  test('POST /api/devices/1/commands with invalid token should return 401 or 403', async () => {
    const response = await request(app)
      .post('/api/devices/1/commands')
      .set('Authorization', 'Bearer invalid_fake_token_123')
      .send({ command: 'RESET' });

    expect([401, 403]).toContain(response.status);
  });
});