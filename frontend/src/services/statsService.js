
import { get } from './api';

export const getOverviewStats = async () => {
  return await get('/stats/overview');
};


export const getCountyLeaderboard = async (limit = 10, days = 30) => {
  return await get(`/stats/counties/leaderboard?limit=${limit}&days=${days}`);
};


export const getWeeklyTrends = async () => {
  return await get('/stats/trends/weekly');
};

export const getLiveCount = async () => {
  return await get('/stats/live/count');
};


export const getPlatformComparison = async (days = 7) => {
  return await get(`/stats/analytics/platform-comparison?days=${days}`);
};


export const getWhatsAppAnalytics = async (days = 30) => {
  return await get(`/stats/analytics/whatsapp?days=${days}`);
};


export const getEventBreakdown = async (days = 7) => {
  return await get(`/stats/analytics/events?days=${days}`);
};

export const getTopCenters = async (limit = 10, days = 30) => {
  return await get(`/stats/centers/top?limit=${limit}&days=${days}`);
};