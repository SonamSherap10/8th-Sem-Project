import { useEffect, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { retailerApi } from '../../api/retailers'
import {
  PageHeader, Button, Card, Table, Loading, EmptyState, Modal, Input, Badge,
} from '../../components/ui'
import { formatCurrency } from '../../utils/format'
import { getErrorMessage } from '../../utils/format'

const emptyRetailer = { name: '', region_id: '', contact_person: '', phone: '', credit_limit: '' }

export default function RetailersPage() {
  const [retailers, setRetailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyRetailer)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setRetailers(await retailerApi.getAll())
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm(emptyRetailer)
    setModal({ type: 'create' })
  }

  const openEdit = (retailer) => {
    setForm({
      name: retailer.name,
      region_id: retailer.region_id,
      contact_person: retailer.contact_person || '',
      phone: retailer.phone || '',
      credit_limit: retailer.credit_limit,
    })
    setModal({ type: 'edit', retailer })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, region_id: Number(form.region_id), credit_limit: Number(form.credit_limit) }
      if (modal.type === 'create') await retailerApi.create(payload)
      else await retailerApi.update(modal.retailer.id, payload)
      setModal(null)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (retailer) => {
    try {
      if (retailer.is_active) await retailerApi.deactivate(retailer.id)
      else await retailerApi.activate(retailer.id)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'Region', label: 'Region', render: (r) => r.Region?.name || r.region_id },
    { key: 'contact_person', label: 'Contact', render: (r) => r.contact_person || '—' },
    { key: 'credit_limit', label: 'Credit Limit', render: (r) => formatCurrency(r.credit_limit) },
    { key: 'current_balance', label: 'Balance', render: (r) => formatCurrency(r.current_balance) },
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
        title="Retailers"
        description="Manage retailer accounts"
        action={<Button onClick={openCreate}><Plus size={16} /> Add Retailer</Button>}
      />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Card>
        {loading ? <Loading /> : retailers.length ? <Table columns={columns} data={retailers} /> : <EmptyState title="No retailers yet" />}
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.type === 'create' ? 'Add Retailer' : 'Edit Retailer'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Region ID" type="number" value={form.region_id} onChange={(e) => setForm({ ...form, region_id: e.target.value })} required />
          <Input label="Contact Person" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Credit Limit" type="number" value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: e.target.value })} required />
        </div>
      </Modal>
    </div>
  )
}
