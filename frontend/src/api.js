import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (email, password, name) => api.post('/auth/register', { email, password, name }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  googleLogin: (email, name) => api.post('/auth/google', { email, name }),
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  },
};

export const formsApi = {
  getForms: async () => {
    try {
      const response = await api.get('/forms');
      return response.data; // Return the whole data object so forms is accessible
    } catch (error) {
      console.error('Error fetching forms:', error);
      return { forms: [], templates: [] };
    }
  },
  getForm: async (id) => {
    try {
      const response = await api.get(`/forms/${id}`);
      return response.data; // The backend returns the form object directly
    } catch (error) {
      console.error('Error fetching form:', error);
      return null;
    }
  },
  createForm: async (form) => {
    try {
      const response = await api.post('/forms', form);
      return response.data; // Return the whole data object so form_id is accessible
    } catch (error) {
      if (error.response) {
        console.error('Error creating form:', error.response.data);
      } else {
        console.error('Error creating form:', error);
      }
      return null;
    }
  },
  updateForm: async (id, updates) => {
    try {
      const response = await api.put(`/forms/${id}`, updates);
      return response.data.data;
    } catch (error) {
      console.error('Error updating form:', error);
      return null;
    }
  },
  deleteForm: async (id) => {
    try {
      await api.delete(`/forms/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting form:', error);
      return false;
    }
  },
  duplicateForm: async (id) => {
    try {
      const response = await api.post(`/forms/${id}/duplicate`);
      return response.data.data;
    } catch (error) {
      console.error('Error duplicating form:', error);
      return null;
    }
  },
};

export const responsesApi = {
  getResponses: async (formId) => {
    try {
      const response = await api.get(`/forms/${formId}/responses`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching responses:', error);
      return [];
    }
  },
  getAnalytics: async (formId) => {
    try {
      const response = await api.get(`/forms/${formId}/analytics`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  },
  submitResponse: async (formId, data) => {
    try {
      await api.post(`/forms/${formId}/responses`, data);
      return true;
    } catch (error) {
      console.error('Error submitting response:', error);
      return false;
    }
  },
};









// // src/api.js
// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api';

// // Configure axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// // Add request interceptor to include JWT token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

// // Auth API
// export const login = async (username, password) => {
//   try {
//     const response = await api.post('/auth/login', { username, password });
//     localStorage.setItem('token', response.data.data.access_token);
//     return true;
//   } catch (error) {
//     console.error('Login error:', error);
//     return false;
//   }
// };

// export const register = async (username, password) => {
//   try {
//     await api.post('/auth/register', { username, password });
//     return true;
//   } catch (error) {
//     console.error('Registration error:', error);
//     return false;
//   }
// };

// // Forms API
// export const getForms = async () => {
//   try {
//     const response = await api.get('/forms');
//     return {
//       forms: response.data.data.forms,
//       templates: response.data.data.templates
//     };
//   } catch (error) {
//     console.error('Error fetching forms:', error);
//     return { forms: [], templates: [] };
//   }
// };

// export const getForm = async (formId) => {
//   try {
//     const response = await api.get(`/forms/${formId}`);
//     return response.data.data;
//   } catch (error) {
//     console.error('Error fetching form:', error);
//     return null;
//   }
// };

// export const createForm = async () => {
//   try {
//     const response = await api.post('/forms', { title: 'Untitled Form' });
//     return response.data.data;
//   } catch (error) {
//     console.error('Error creating form:', error);
//     return null;
//   }
// };

// export const updateForm = async (formId, formData) => {
//   try {
//     const response = await api.put(`/forms/${formId}`, formData);
//     return response.data.data;
//   } catch (error) {
//     console.error('Error updating form:', error);
//     return null;
//   }
// };

// export const deleteForm = async (formId) => {
//   try {
//     await api.delete(`/forms/${formId}`);
//     return true;
//   } catch (error) {
//     console.error('Error deleting form:', error);
//     return false;
//   }
// };

// export const duplicateForm = async (formId) => {
//   try {
//     const response = await api.post(`/forms/${formId}/duplicate`);
//     return response.data.data;
//   } catch (error) {
//     console.error('Error duplicating form:', error);
//     return null;
//   }
// };

// // Responses API
// export const getResponses = async (formId) => {
//   try {
//     const response = await api.get(`/forms/${formId}/responses`);
//     return response.data.data;
//   } catch (error) {
//     console.error('Error fetching responses:', error);
//     return [];
//   }
// };

// export const getAnalytics = async (formId) => {
//   try {
//     const response = await api.get(`/forms/${formId}/analytics`);
//     return response.data.data;
//   } catch (error) {
//     console.error('Error fetching analytics:', error);
//     return null;
//   }
// };

// export const submitResponse = async (formId, responseData) => {
//   try {
//     await api.post(`/forms/${formId}/responses`, responseData);
//     return true;
//   } catch (error) {
//     console.error('Error submitting response:', error);
//     return false;
//   }
// };