export const checkVoltageStatus = (voltage) => {
  if (voltage > 250) {
    return 'CRITICAL';
  } else if (voltage >= 220) {
    return 'NORMAL';
  } else {
    return 'LOW';
  }
};