import api from './api';

const analyticsService = {
  // Log a prompt insertion event
  logPromptInsert: async (promptData) => {
    try {
      const response = await api.post('/analytics/prompt-insert', promptData);
      return response.data;
    } catch (error) {
      console.error('Error logging prompt insert:', error);
      throw error;
    }
  }
};

export default analyticsService;
