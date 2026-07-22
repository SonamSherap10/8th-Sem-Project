import client, { unwrap } from './client'

export const returnApi = {
  create: (data) => client.post('/api/returns', data).then(unwrap),
  getPending: () => client.get('/api/returns/pending').then(unwrap),
  process: (id, data) => client.put(`/api/returns/${id}/process`, data).then(unwrap),
}
