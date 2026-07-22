import client, { unwrap } from './client'

export const orderApi = {
  create: (data) => client.post('/api/orders', data).then(unwrap),
  getMyRetailers: () => client.get('/api/orders/my-retailers').then(unwrap),
  getAll: (params) => client.get('/api/orders', { params }).then(unwrap),
  getById: (id) => client.get(`/api/orders/${id}`).then(unwrap),
  cancel: (id) => client.put(`/api/orders/${id}/cancel`).then(unwrap),
}
