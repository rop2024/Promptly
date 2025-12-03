import api from './api.js';

// Entry service
const entryService = {
  // Get all entries with optional filters
  getEntries: async (filters = {}) => {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/entries?${params}`);
    return response; // return full axios response (caller expects result.data)
  },

  // Get single entry
  getEntry: async (id) => {
    const response = await api.get(`/entries/${id}`);
    return response;
  },

  // Create entry
  createEntry: async (entryData) => {
    const response = await api.post('/entries', entryData);
    return response;
  },

  // Update entry
  updateEntry: async (id, entryData) => {
    const response = await api.put(`/entries/${id}`, entryData);
    return response;
  },

  // Delete entry
  deleteEntry: async (id) => {
    const response = await api.delete(`/entries/${id}`);
    return response;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/entries/stats/overview');
    return response;
  },

  // Get all tags
  getAllTags: async () => {
    const response = await api.get('/entries/tags/all');
    return response;
  }
};

export default entryService;