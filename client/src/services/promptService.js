import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with auth
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Prompt service
const promptService = {
  // Get today's prompt
  getTodaysPrompt: async () => {
    const response = await api.get('/prompts/today');
    return response.data;
  },

  // Mark prompt as completed
  completePrompt: async () => {
    const response = await api.post('/prompts/complete');
    return response.data;
  },

  // Skip today's prompt
  skipPrompt: async () => {
    const response = await api.post('/prompts/skip');
    return response.data;
  },

  // Get prompt statistics
  getPromptStats: async () => {
    const response = await api.get('/prompts/stats');
    return response.data;
  },

  // Update prompt preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/prompts/preferences', preferences);
    return response.data;
  },

  // Utility function to check if user has completed prompt today
  hasCompletedPromptToday: () => {
    const lastPromptDate = localStorage.getItem('lastPromptDate');
    if (!lastPromptDate) return false;
    
    const today = new Date().toISOString().split('T')[0];
    return lastPromptDate === today;
  },

  // Utility function to store completion locally
  storeLocalCompletion: () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('lastPromptDate', today);
  },

  // Utility function to get today's date string
  getTodayDateString: () => {
    return new Date().toISOString().split('T')[0];
  }
};

export default promptService;