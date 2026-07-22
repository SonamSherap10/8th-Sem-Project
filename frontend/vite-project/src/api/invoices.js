import client, { unwrap } from './client'

export const invoiceApi = {
  getAll: (params) => client.get('/api/invoices', { params }).then(unwrap),
  getById: (id) => client.get(`/api/invoices/${id}`).then(unwrap),
  getByOrder: (orderId) => client.get(`/api/invoices/order/${orderId}`).then(unwrap),
}
