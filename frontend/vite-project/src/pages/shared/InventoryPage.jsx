import { useEffect, useState } from 'react'
import { batchApi } from '../../api/batches'
import { productApi } from '../../api/products'
import {
  PageHeader, Button, Card, Table, Loading, EmptyState, Modal, Input, Select, Badge,
} from '../../components/ui'
import { formatDate, getErrorMessage } from '../../utils/format'

export default function InventoryPage({ canAdjust = false }) {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [adjustModal, setAdjustModal] = useState(null)
  const [adjustForm, setAdjustForm] = useState({ quantity: '', reason: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter === 'expiring') params.expiring_soon = 'true'
      if (filter === 'low') params.low_stock = 'true'
      setBatches(await batchApi.getAll(params))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const handleAdjust = async () => {
    setSaving(true)
    try {
      await batchApi.adjust(adjustModal.id, {
        quantity: Number(adjustForm.quantity),
        reason: adjustForm.reason,
      })
      setAdjustModal(null)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'Product', label: 'Product', render: (r) => r.Product?.name || r.product_id },
    { key: 'batch_number', label: 'Batch #' },
    { key: 'quantity_remaining', label: 'Remaining' },
    { key: 'quantity_received', label: 'Received' },
    { key: 'received_date', label: 'Received', render: (r) => formatDate(r.received_date) },
    { key: 'expiry_date', label: 'Expiry', render: (r) => formatDate(r.expiry_date) },
    ...(canAdjust
      ? [{
          key: 'actions',
          label: 'Actions',
          render: (r) => (
            <Button size="sm" variant="secondary" onClick={() => { setAdjustModal(r); setAdjustForm({ quantity: r.quantity_remaining, reason: '' }) }}>
              Adjust
            </Button>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Batch inventory and stock levels"
        action={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-44">
            <option value="">All Batches</option>
            <option value="expiring">Expiring Soon</option>
            <option value="low">Low Stock</option>
          </Select>
        }
      />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Card>
        {loading ? <Loading /> : batches.length ? <Table columns={columns} data={batches} /> : <EmptyState title="No batches found" />}
      </Card>

      {canAdjust && (
        <Modal
          open={!!adjustModal}
          onClose={() => setAdjustModal(null)}
          title="Adjust Batch Quantity"
          footer={
            <>
              <Button variant="secondary" onClick={() => setAdjustModal(null)}>Cancel</Button>
              <Button onClick={handleAdjust} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input label="New Quantity" type="number" value={adjustForm.quantity} onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })} />
            <Input label="Reason" value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} required />
          </div>
        </Modal>
      )}
    </div>
  )
}

export function ReceiveStockPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({
    product_id: '', batch_number: '', quantity_received: '', received_date: '', expiry_date: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    productApi.getAll({ is_active: 'true' }).then(setProducts).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const batch = await batchApi.create({
        ...form,
        product_id: Number(form.product_id),
        quantity_received: Number(form.quantity_received),
        expiry_date: form.expiry_date || undefined,
      })
      setMessage(`Batch ${batch.batch_number} received successfully`)
      setForm({ product_id: '', batch_number: '', quantity_received: '', received_date: '', expiry_date: '' })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Receive Stock" description="Record incoming inventory batches" />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
      <Card title="New Batch">
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <Select label="Product" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required>
            <option value="">Select product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Input label="Batch Number" value={form.batch_number} onChange={(e) => setForm({ ...form, batch_number: e.target.value })} required />
          <Input label="Quantity Received" type="number" value={form.quantity_received} onChange={(e) => setForm({ ...form, quantity_received: e.target.value })} required />
          <Input label="Received Date" type="date" value={form.received_date} onChange={(e) => setForm({ ...form, received_date: e.target.value })} required />
          <Input label="Expiry Date (if perishable)" type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Receive Stock'}</Button>
        </form>
      </Card>
    </div>
  )
}
