import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';

// 1. สร้าง Object สำหรับ Mock Prisma Function
const mockFindUnique = jest.fn();

// 2. Mock โมดูล @prisma/client แบบ ES Modules (ต้องทำก่อน import authController)
jest.unstable_mockModule('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: mockFindUnique,
    },
  })),
}));

// 3. Dynamic Import โมดูลที่เราจะทดสอบ หลังจากทำ mockModule เรียบร้อยแล้ว
const { loginUser } = await import('../src/controllers/authController.js');

describe('Auth Controller - Mocking Database Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Success Case: DB เจอ User และรหัสผ่านถูกต้อง
  test('should login successfully and return JWT token when credentials are valid', async () => {
    const mockUser = {
      id: 1,
      username: 'admin1',
      passwordHash: await bcrypt.hash('secret123', 10),
      role: 'admin',
    };

    // จำลองให้ DB คืนค่า mockUser กลับมา
    mockFindUnique.mockResolvedValue(mockUser);

    const result = await loginUser('admin1', 'secret123');

    expect(result).toHaveProperty('token');
    expect(result.user.username).toBe('admin1');
    expect(mockFindUnique).toHaveBeenCalledTimes(1);
  });

  // Failure Case: DB คืนค่า null (ไม่พบผู้ใช้)
  test('should throw Invalid Credentials error when user is not found in DB', async () => {
    // จำลองให้ DB คืนค่า null
    mockFindUnique.mockResolvedValue(null);

    await expect(loginUser('nonexistent_user', 'password123'))
      .rejects
      .toThrow('Invalid Credentials');

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { username: 'nonexistent_user' },
    });
  });
});