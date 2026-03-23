import { get } from './api';

export const getSessionStats = async (days = 7) => {
  return await get(`/whatsapp/stats/sessions?days=${days}`);
};