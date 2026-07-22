import client, { unwrap } from './client'

export const deliveryApi = {
  getAll: (params) => client.get('/api/deliveries', { params }).then(unwrap),
  markInTransit: (id) => client.put(`/api/deliveries/${id}/in-transit`).then(unwrap),
  markDelivered: (id) => client.put(`/api/deliveries/${id}/delivered`).then(unwrap),
}
