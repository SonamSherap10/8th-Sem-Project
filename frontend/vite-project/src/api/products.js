import client, { unwrap } from './client'

export const productApi = {
  getAll: (params) => client.get('/api/products', { params }).then(unwrap),
}
