import client, { unwrap } from './client'

export const retailerApi = {
  create: (data) => client.post('/api/retailers', data).then(unwrap),
  getAll: (params) => client.get('/api/retailers', { params }).then(unwrap),
  getById: (id) => client.get(`/api/retailers/${id}`).then(unwrap),
  update: (id, data) => client.put(`/api/retailers/${id}`, data).then(unwrap),
  deactivate: (id) => client.put(`/api/retailers/${id}/deactivate`),
  activate: (id) => client.put(`/api/retailers/${id}/activate`),
}
