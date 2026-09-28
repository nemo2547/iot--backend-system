import { checkVoltageStatus } from '../utils/voltageChecker.js';

describe('Voltage Checker Unit Tests (AAA Pattern)', () => {
  // เคส 1: ส่งค่า 260 ต้องคืนค่า 'CRITICAL'
  test('should return CRITICAL when voltage is greater than 250', () => {
    // Arrange (จัดเตรียมข้อมูล)
    const inputVoltage = 260;

    // Act (เรียกใช้ฟังก์ชัน)
    const result = checkVoltageStatus(inputVoltage);

    // Assert (ตรวจสอบผลลัพธ์)
    expect(result).toBe('CRITICAL');
  });

  // เคส 2: ส่งค่า 230 ต้องคืนค่า 'NORMAL'
  test('should return NORMAL when voltage is between 220 and 250', () => {
    // Arrange
    const inputVoltage = 230;

    // Act
    const result = checkVoltageStatus(inputVoltage);

    // Assert
    expect(result).toBe('NORMAL');
  });

  // เคส 3: ส่งค่า 200 ต้องคืนค่า 'LOW'
  test('should return LOW when voltage is less than 220', () => {
    // Arrange
    const inputVoltage = 200;

    // Act
    const result = checkVoltageStatus(inputVoltage);

    // Assert
    expect(result).toBe('LOW');
  });
});