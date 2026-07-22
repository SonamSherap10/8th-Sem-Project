import client, { unwrap } from './client'

export const paymentApi = {
  record: (data) => client.post('/api/payments', data).then(unwrap),
  getMyCollections: (params) => client.get('/api/payments/my-collections', { params }).then(unwrap),
  getByInvoice: (invoiceId) => client.get(`/api/payments/invoice/${invoiceId}`).then(unwrap),
}
