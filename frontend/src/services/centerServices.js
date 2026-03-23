import { get, post } from './api';

export const getCenters = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.county && filters.county !== 'All Kenya') {
    params.append('county', filters.county);
  }
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  if (filters.lat && filters.lng) {
    params.append('lat', filters.lat);
    params.append('lng', filters.lng);
    params.append('radius', filters.radius || 10);
  }
  
  const queryString = params.toString();
  return await get(`/centers${queryString ? `?${queryString}` : ''}`);
};

export const getCenterById = async (id) => {
  return await get(`/centers/${id}`);
};

export const checkProximity = async (centerId, userLat, userLng, maxDistanceKm = 0.5) => {
  return await post('/centers/check-proximity', {
    centerId,
    userLat,
    userLng,
    maxDistanceKm
  });
};

export const findNearestCenters = async (lat, lng, limit = 5, radius = 10) => {
  const params = new URLSearchParams({ lat, lng, limit, radius });
  return await get(`/centers/nearby/search?${params}`);
};

export const getCentersByCounty = async (county) => {
  return await get(`/centers/county/${county}`);
};


export const getAllCounties = async () => {
  return await get('/centers/meta/counties');
};