import { get, post } from './api';

export const getCenters = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.county && filters.county !== 'All Kenya') params.append('county', filters.county);
  if (filters.search)  params.append('search', filters.search);
  if (filters.lat && filters.lng) {
    params.append('lat', filters.lat);
    params.append('lng', filters.lng);
    params.append('radius', filters.radius || 10);
  }
  const queryString = params.toString();
  return await get(`/centers${queryString ? `?${queryString}` : ''}`);
};

export const getCenterById = async (id) => get(`/centers/${id}`);

export const checkProximity = async (centerId, userLat, userLng, maxDistanceKm = 0.5) =>
  post('/centers/check-proximity', { centerId, userLat, userLng, maxDistanceKm });

export const findNearestCenters = async (lat, lng, limit = 5, radius = 10) => {
  const params = new URLSearchParams({ lat, lng, limit, radius });
  return get(`/centers/nearby/search?${params}`);
};

export const getCentersByCounty = async (county) => get(`/centers/county/${county}`);

export const getAllCounties = async () => get('/centers/meta/counties');

// ── NEW ───────────────────────────────────────────────────────────────────────
export const addCenter = async ({ name, county, constituency, ward, type, address, landmark, latitude, longitude }) =>
  post('/centers', { name, county, constituency, ward, type, address, landmark, latitude, longitude });



