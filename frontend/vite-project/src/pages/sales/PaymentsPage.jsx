import { useEffect, useState } from 'react'
import { paymentApi } from '../../api/payments'
import { invoiceApi } from '../../api/invoices'
import {
  PageHeader, Button, Card, Table, Loading, EmptyState, Modal, Input, Select,
} from '../../components/ui'
import { PAYMENT_METHODS } from '../../utils/constants'
import { formatCurrency, formatDate, capitalize, getErrorMessage } from '../../utils/format'

export default function PaymentsPage() {
  const [collections, setCollections] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ invoice_id: '', amount: '', method: 'cash' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [collectionsData, invoicesData] = await Promise.all([
        paymentApi.getMyCollections(),
        invoiceApi.getAll({ status: 'unpaid' }),
      ])
      setCollections(collectionsData)
      setInvoices(invoicesData.filter((inv) => inv.status !== 'paid'))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRecord = async () => {
    setSaving(true)
    try {
      await paymentApi.record({
        invoice_id: Number(form.invoice_id),
        amount: Number(form.amount),
        method: form.method,
      })
      setModal(false)
      setForm({ invoice_id: '', amount: '', method: 'cash' })
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'Invoice', label: 'Invoice', render: (r) => r.Invoice?.invoice_number || '—' },
    { key: 'Retailer', label: 'Retailer', render: (r) => r.Retailer?.name || '—' },
    { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'method', label: 'Method', render: (r) => capitalize(r.method) },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
  ]

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Record and view payment collections"
        action={<Button onClick={() => setModal(true)}>Record Payment</Button>}
      />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Card title="My Collections">
        {loading ? <Loading /> : collections.length ? <Table columns={columns} data={collections} /> : <EmptyState title="No collections yet" />}
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Record Payment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleRecord} disabled={saving}>{saving ? 'Saving...' : 'Record'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Invoice" value={form.invoice_id} onChange={(e) => setForm({ ...form, invoice_id: e.target.value })}>
            <option value="">Select invoice</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoice_number} — {formatCurrency(inv.total_amount - (inv.amount_paid || 0))} due
              </option>
            ))}
          </Select>
          <Input label="Amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Select label="Method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{capitalize(m)}</option>)}
          </Select>
        </div>
      </Modal>
    </div>
  )
}
