import client, { unwrap } from './client'

export const adminApi = {
  getUsers: (params) => client.get('/api/admin/users', { params }).then(unwrap),
  getUser: (id) => client.get(`/api/admin/users/${id}`).then(unwrap),
  updateUser: (id, data) => client.put(`/api/admin/users/${id}`, data).then(unwrap),
  changePassword: (id, new_password) =>
    client.patch(`/api/admin/users/${id}/password`, { new_password }),
  deactivateUser: (id) => client.patch(`/api/admin/users/${id}/deactivate`),
  activateUser: (id) => client.patch(`/api/admin/users/${id}/activate`),

  createProduct: (data) => client.post('/api/admin/products', data).then(unwrap),
  getProducts: (params) => client.get('/api/admin/products', { params }).then(unwrap),
  getProduct: (id) => client.get(`/api/admin/products/${id}`).then(unwrap),
  updateProduct: (id, data) => client.put(`/api/admin/products/${id}`, data).then(unwrap),
  deactivateProduct: (id) => client.patch(`/api/admin/products/${id}/deactivate`),
  activateProduct: (id) => client.patch(`/api/admin/products/${id}/activate`),

  getAllOrders: () => client.get('/api/admin/get-all-orders').then(unwrap),
  getOrder: (id) => client.get(`/api/admin/orders/${id}`).then(unwrap),

  createSalesTarget: (data) => client.post('/api/admin/sales-targets', data).then(unwrap),
  getSalesTargets: (params) => client.get('/api/admin/sales-targets', { params }).then(unwrap),
  getSalesTarget: (id) => client.get(`/api/admin/sales-targets/${id}`).then(unwrap),
  updateSalesTarget: (id, data) => client.put(`/api/admin/sales-targets/${id}`, data).then(unwrap),
  deleteSalesTarget: (id) => client.delete(`/api/admin/sales-targets/${id}`),
getRepPerformance: (userId, month, year) =>
  client.get(`/api/admin/sales-targets/performance/${userId}`, { params: { month, year } }).then(unwrap),
  createRegion: (data) => client.post('/api/admin/regions', data).then(unwrap),
}
