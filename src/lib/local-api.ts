// API base URL
const API_BASE_URL = 'http://localhost:3003/api';

// Utility functions for making API calls to the local server
export const api = {
  // Routes
  getRoutes: async () => {
    const response = await fetch(`${API_BASE_URL}/routes`);
    if (!response.ok) throw new Error('Failed to fetch routes');
    return response.json();
  },
  
  createRoute: async (routeData: any) => {
    const response = await fetch(`${API_BASE_URL}/routes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(routeData),
    });
    if (!response.ok) throw new Error('Failed to create route');
    return response.json();
  },
  
  updateRoute: async (id: string, routeData: any) => {
    const response = await fetch(`${API_BASE_URL}/routes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(routeData),
    });
    if (!response.ok) throw new Error('Failed to update route');
    return response.json();
  },
  
  deleteRoute: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/routes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete route');
    return response.json();
  },
  
  // Schedules
  getSchedules: async () => {
    const response = await fetch(`${API_BASE_URL}/schedules`);
    if (!response.ok) throw new Error('Failed to fetch schedules');
    return response.json();
  },
  
  createSchedule: async (scheduleData: any) => {
    const response = await fetch(`${API_BASE_URL}/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleData),
    });
    if (!response.ok) throw new Error('Failed to create schedule');
    return response.json();
  },
  
  updateSchedule: async (id: string, scheduleData: any) => {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleData),
    });
    if (!response.ok) throw new Error('Failed to update schedule');
    return response.json();
  },
  
  deleteSchedule: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete schedule');
    return response.json();
  },
  
  // Time infos
  getTimeInfos: async () => {
    const response = await fetch(`${API_BASE_URL}/time-infos`);
    if (!response.ok) throw new Error('Failed to fetch time infos');
    return response.json();
  },
  
  createTimeInfo: async (timeInfoData: any) => {
    const response = await fetch(`${API_BASE_URL}/time-infos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timeInfoData),
    });
    if (!response.ok) throw new Error('Failed to create time info');
    return response.json();
  },
  
  updateTimeInfo: async (id: string, timeInfoData: any) => {
    const response = await fetch(`${API_BASE_URL}/time-infos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timeInfoData),
    });
    if (!response.ok) throw new Error('Failed to update time info');
    return response.json();
  },
  
  deleteTimeInfo: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/time-infos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete time info');
    return response.json();
  },
  
  // Public holidays
  getPublicHolidays: async () => {
    const response = await fetch(`${API_BASE_URL}/public-holidays`);
    if (!response.ok) throw new Error('Failed to fetch public holidays');
    return response.json();
  },
  
  createPublicHoliday: async (holidayData: any) => {
    const response = await fetch(`${API_BASE_URL}/public-holidays`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holidayData),
    });
    if (!response.ok) throw new Error('Failed to create public holiday');
    return response.json();
  },
  
  updatePublicHoliday: async (id: string, holidayData: any) => {
    const response = await fetch(`${API_BASE_URL}/public-holidays/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holidayData),
    });
    if (!response.ok) throw new Error('Failed to update public holiday');
    return response.json();
  },
  
  deletePublicHoliday: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/public-holidays/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete public holiday');
    return response.json();
  },
  
  // Fares
  getFares: async (scheduleId: string) => {
    const response = await fetch(`${API_BASE_URL}/fares/${scheduleId}`);
    if (!response.ok) throw new Error('Failed to fetch fares');
    return response.json();
  },
  
  createFare: async (fareData: any) => {
    const response = await fetch(`${API_BASE_URL}/fares`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fareData),
    });
    if (!response.ok) throw new Error('Failed to create fare');
    return response.json();
  },
  
  updateFare: async (id: string, fareData: any) => {
    const response = await fetch(`${API_BASE_URL}/fares/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fareData),
    });
    if (!response.ok) throw new Error('Failed to update fare');
    return response.json();
  },
  
  deleteFare: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/fares/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete fare');
    return response.json();
  },
  
  // Departure times
  getDepartureTimes: async (scheduleId: string) => {
    const response = await fetch(`${API_BASE_URL}/departure-times/${scheduleId}`);
    if (!response.ok) throw new Error('Failed to fetch departure times');
    return response.json();
  },
  
  createDepartureTime: async (departureTimeData: any) => {
    const response = await fetch(`${API_BASE_URL}/departure-times`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(departureTimeData),
    });
    if (!response.ok) throw new Error('Failed to create departure time');
    return response.json();
  },
  
  updateDepartureTime: async (id: string, departureTimeData: any) => {
    const response = await fetch(`${API_BASE_URL}/departure-times/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(departureTimeData),
    });
    if (!response.ok) throw new Error('Failed to update departure time');
    return response.json();
  },
  
  deleteDepartureTime: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/departure-times/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete departure time');
    return response.json();
  },
};