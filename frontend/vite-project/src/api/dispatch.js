import client, { unwrap } from './client'

export const dispatchApi = {
  getConfirmedOrders: () => client.get('/api/dispatch/confirmed').then(unwrap),
  dispatch: (orderId) => client.post(`/api/dispatch/${orderId}`).then(unwrap),
  getSummary: (orderId) => client.get(`/api/dispatch/${orderId}/summary`).then(unwrap),
}
