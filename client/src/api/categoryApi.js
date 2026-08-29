import apiClient from './apiClient';

export const categoryApi = {
  getAll: () => apiClient.get('/categories'),
  create: (data) => apiClient.post('/categories', data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`),

  // Subcategories
  getSubcategories: (categoryId) =>
    apiClient.get('/subcategories', { params: { categoryId } }),
  createSubcategory: (data) => apiClient.post('/subcategories', data),
  updateSubcategory: (id, data) => apiClient.put(`/subcategories/${id}`, data),
  deleteSubcategory: (id) => apiClient.delete(`/subcategories/${id}`),
};
