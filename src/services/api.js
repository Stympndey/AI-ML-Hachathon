import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example API calls (these can be expanded as needed)
export const fetchHealthData = async () => {
  try {
    const response = await api.get('/health-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching health data:', error);
    throw error;
  }
};

export const uploadReport = async (data) => {
  try {
    const response = await api.post('/upload-report', data);
    return response.data;
  } catch (error) {
    console.error('Error uploading report:', error);
    throw error;
  }
};

export const getDrugInteractions = async (drugs) => {
  try {
    const response = await api.post('/drug-interactions', { drugs });
    return response.data;
  } catch (error) {
    console.error('Error getting drug interactions:', error);
    throw error;
  }
};

export default api;
