
// Sample departure times for different schedule types
export const weekdayTimes = ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '17:30', '18:00', '18:30', '19:00', '20:00'];
export const weekendTimes = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
export const holidayTimes = ['09:00', '11:00', '13:00', '15:00', '17:00'];

export const createFareTemplates = (scheduleId: string, type: 'weekday' | 'weekend' | 'holiday') => {
  const basePrices = {
    weekday: { adult: 3.50, student: 2.50, senior: 2.00, child: 1.50 },
    weekend: { adult: 3.85, student: 2.75, senior: 2.20, child: 1.65 },
    holiday: { adult: 4.20, student: 3.00, senior: 2.40, child: 1.80 }
  };
  
  const prices = basePrices[type];
  
  return [
    { name: 'Adult', fare_type: 'standard', price: prices.adult, currency: 'USD', description: 'Standard adult fare', schedule_id: scheduleId },
    { name: 'Student', fare_type: 'student', price: prices.student, currency: 'USD', description: 'Student discount fare', schedule_id: scheduleId },
    { name: 'Senior', fare_type: 'senior', price: prices.senior, currency: 'USD', description: 'Senior citizen fare', schedule_id: scheduleId },
    { name: 'Child', fare_type: 'child', price: prices.child, currency: 'USD', description: 'Child fare (under 12)', schedule_id: scheduleId }
  ];
};
