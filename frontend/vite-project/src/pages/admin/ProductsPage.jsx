import { useEffect, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { adminApi } from '../../api/admin'
import {
  PageHeader, Button, Card, Table, Loading, EmptyState, Modal, Input, Select, Badge,
} from '../../components/ui'
import { formatCurrency } from '../../utils/format'
import { getErrorMessage } from '../../utils/format'

const emptyProduct = { name: '', category: '', unit: '', price: '', reorder_threshold: '', is_perishable: false }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setProducts(await adminApi.getProducts())
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm(emptyProduct)
    setModal({ type: 'create' })
  }

  const openEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category || '',
      unit: product.unit,
      price: product.price,
      reorder_threshold: product.reorder_threshold,
      is_perishable: product.is_perishable,
    })
    setModal({ type: 'edit', product })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        reorder_threshold: Number(form.reorder_threshold),
        is_perishable: Boolean(form.is_perishable),
      }
      if (modal.type === 'create') await adminApi.createProduct(payload)
      else await adminApi.updateProduct(modal.product.id, payload)
      setModal(null)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (product) => {
    try {
      if (product.is_active) await adminApi.deactivateProduct(product.id)
      else await adminApi.activateProduct(product.id)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category', render: (r) => r.category || '—' },
    { key: 'unit', label: 'Unit' },
    { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
    { key: 'reorder_threshold', label: 'Reorder At' },
    {
      key: 'is_active',
      label: 'Status',
      render: (r) => <Badge status={r.is_active ? 'paid' : 'cancelled'}>{r.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEdit(r)}><Pencil size={14} /></Button>
          <Button size="sm" variant={r.is_active ? 'danger' : 'success'} onClick={() => toggleActive(r)}>
            {r.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage product catalog"
        action={<Button onClick={openCreate}><Plus size={16} /> Add Product</Button>}
      />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Card>
        {loading ? <Loading /> : products.length ? <Table columns={columns} data={products} /> : <EmptyState title="No products yet" />}
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.type === 'create' ? 'Add Product' : 'Edit Product'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="e.g. kg, box, unit" required />
          <Input label="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <Input label="Reorder Threshold" type="number" value={form.reorder_threshold} onChange={(e) => setForm({ ...form, reorder_threshold: e.target.value })} required />
          <Select label="Perishable" value={String(form.is_perishable)} onChange={(e) => setForm({ ...form, is_perishable: e.target.value === 'true' })}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </Select>
        </div>
      </Modal>
    </div>
  )
}
