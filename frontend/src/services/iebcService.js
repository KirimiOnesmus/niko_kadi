
import { get, post } from './api';

export const verifyVoter = async (idNumber) => {
  return await post('/iebc/verify', {
    idNumber,
    source: 'web'
  });
};
export const getIEBCApiStatus = async () => {
  return await get('/iebc/api-status');
};

export const getVerificationStats = async (days = 7) => {
  return await get(`/iebc/stats?days=${days}`);
};