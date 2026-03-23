

const API_BASE_URL = import.meta.env.VITE_API_URL ;


const getSessionId = () => {
  let sessionId = sessionStorage.getItem('niko-kadi-session');
  if (!sessionId) {
    sessionId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('niko-kadi-session', sessionId);
  }
  return sessionId;
};


const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }
  
  return data;
};


const apiRequest = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'x-source': 'web',
      'x-session-id': getSessionId(),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


export const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'GET' });
};


export const post = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};


export { API_BASE_URL, apiRequest, getSessionId };