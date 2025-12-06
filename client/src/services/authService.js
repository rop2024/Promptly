import api from './api.js';

const storageUserKey = 'promptly_user';
const storageTokenKey = 'promptly_token';

const setAuth = (token, user) => {
  if (token) {
    localStorage.setItem(storageTokenKey, token);
  }
  if (user) {
    localStorage.setItem(storageUserKey, JSON.stringify(user));
  }
};

const clearAuth = () => {
  localStorage.removeItem(storageUserKey);
  localStorage.removeItem(storageTokenKey);
};

const authService = {
  login: async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    // server responds with { success, token, user }
    if (res.data?.token) {
      setAuth(res.data.token, res.data.user);
    }
    return res.data;
  },

  register: async ({ name, email, password }) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.token) {
      setAuth(res.data.token, res.data.user);
    }
    return res.data;
  },

  logout: () => {
    clearAuth();
  },

  getCurrentUser: () => {
    const raw = localStorage.getItem(storageUserKey);
    return raw ? JSON.parse(raw) : null;
  },

  getProtectedData: async () => {
    // this hits /api/auth/me which is protected
    return api.get('/auth/me');
  },

  updateDetails: async ({ name, email, bio }) => {
    const res = await api.put('/auth/updatedetails', { name, email, bio });
    if (res.data?.data) {
      // Update local storage with new user data
      const currentUser = authService.getCurrentUser();
      const updatedUser = { ...currentUser, ...res.data.data };
      localStorage.setItem(storageUserKey, JSON.stringify(updatedUser));
    }
    return res;
  },

  updatePassword: async ({ currentPassword, newPassword }) => {
    const res = await api.put('/auth/updatepassword', { currentPassword, newPassword });
    if (res.data?.token) {
      localStorage.setItem(storageTokenKey, res.data.token);
    }
    return res;
  }
};

export default authService;
