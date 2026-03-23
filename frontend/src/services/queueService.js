import { get, post } from './api';


export const submitQueueReport = async (data) => {
  return await post('/queues/report', {
    centerId: data.centerId,
    status: data.status, 
    userLat: data.userLat,
    userLng: data.userLng,
    source: 'web'
  });
};

export const getCenterQueueReports = async (centerId, hours = 2) => {
  return await get(`/queues/center/${centerId}?hours=${hours}`);
};


export const getAllQueueStats = async () => {
  return await get('/queues/stats/all');
};


export const voteOnReport = async (reportId, helpful) => {
  return await post(`/queues/${reportId}/vote`, { helpful });
};

export const getQueueReportById = async (reportId) => {
  return await get(`/queues/${reportId}`);
};