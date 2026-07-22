import client, { unwrap } from './client'

export const alertApi = {
  checkExpiry: () => client.post('/api/alerts/check-expiry').then(unwrap),
  checkLowStock: () => client.post('/api/alerts/check-low-stock').then(unwrap),
  checkOverdue: () => client.post('/api/alerts/check-overdue').then(unwrap),
  getAll: (params) => client.get('/api/alerts', { params }).then(unwrap),
  markRead: (id) => client.put(`/api/alerts/${id}/read`),
}
