
import { get, post } from './api';

export const getWeeklyTopics = async () => {
  return await get('/topics/weekly');
};

export const refreshTopics = async () => {
  return await post('/topics/refresh');
};


export const getCacheStatus = async () => {
  return await get('/topics/cache-status');
};