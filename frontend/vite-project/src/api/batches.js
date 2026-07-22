import client, { unwrap } from './client'

export const batchApi = {
  create: (data) => client.post('/api/batches', data).then(unwrap),
  getAll: (params) => client.get('/api/batches', { params }).then(unwrap),
  getByProduct: (productId) => client.get(`/api/batches/product/${productId}`).then(unwrap),
  getById: (id) => client.get(`/api/batches/${id}`).then(unwrap),
  adjust: (id, data) => client.put(`/api/batches/${id}/adjust`, data).then(unwrap),
}
