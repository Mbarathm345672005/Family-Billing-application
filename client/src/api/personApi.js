import apiClient from './apiClient';

export const personApi = {
  getAll: () => apiClient.get('/people'),
  create: (data) => apiClient.post('/people', data),
  update: (id, data) => apiClient.put(`/people/${id}`, data),
  delete: (id) => apiClient.delete(`/people/${id}`),
};
