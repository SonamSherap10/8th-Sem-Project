import { useEffect, useState } from 'react'
import { Plus, BarChart3 } from 'lucide-react'
import { adminApi } from '../../api/admin'
import {
  PageHeader, Button, Card, Table, Loading, EmptyState, Modal, Input, Select,
} from '../../components/ui'
import { formatCurrency, getErrorMessage } from '../../utils/format'

export default function SalesTargetsPage() {
  const [targets, setTargets] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [perfModal, setPerfModal] = useState(null)
  const [form, setForm] = useState({ user_id: '', target_amount: '', month: '', year: new Date().getFullYear() })
  const [perfForm, setPerfForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  const [performance, setPerformance] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [targetsData, usersData] = await Promise.all([
        adminApi.getSalesTargets(),
        adminApi.getUsers({ role: 'sales_rep' }),
      ])
      setTargets(targetsData)
      setUsers(usersData)
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      await adminApi.createSalesTarget({
        user_id: Number(form.user_id),
        target_amount: Number(form.target_amount),
        month: Number(form.month),
        year: Number(form.year),
      })
      setModal(null)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteSalesTarget(id)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const viewPerformance = async (userId) => {
    setPerfModal(userId)
    setPerformance(null)
    try {
      const data = await adminApi.getRepPerformance(userId, Number(perfForm.month), Number(perfForm.year))
      setPerformance(data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const columns = [
    { key: 'User', label: 'Sales Rep', render: (r) => r.User?.name || r.user_id },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'target_amount', label: 'Target', render: (r) => formatCurrency(r.target_amount) },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => { setPerfModal(r.user_id); viewPerformance(r.user_id) }}>
            <BarChart3 size={14} /> Performance
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Delete</Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Sales Targets"
        description="Set and track sales representative targets"
        action={<Button onClick={() => setModal(true)}><Plus size={16} /> Set Target</Button>}
      />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Card>
        {loading ? <Loading /> : targets.length ? <Table columns={columns} data={targets} /> : <EmptyState title="No sales targets set" />}
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(null)}
        title="Set Sales Target"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Sales Rep" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
            <option value="">Select rep</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
          <Input label="Target Amount" type="number" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} />
          <Input label="Month (1-12)" type="number" min="1" max="12" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
          <Input label="Year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        </div>
      </Modal>

      <Modal open={!!perfModal} onClose={() => { setPerfModal(null); setPerformance(null) }} title="Sales Rep Performance">
        <div className="mb-4 flex gap-2">
          <Input type="number" placeholder="Month" value={perfForm.month} onChange={(e) => setPerfForm({ ...perfForm, month: e.target.value })} />
          <Input type="number" placeholder="Year" value={perfForm.year} onChange={(e) => setPerfForm({ ...perfForm, year: e.target.value })} />
          <Button onClick={() => viewPerformance(perfModal)}>Load</Button>
        </div>
        {performance && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-slate-500">Total Sold</p><p className="font-bold">{formatCurrency(performance.total_sold)}</p></div>
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-slate-500">Target</p><p className="font-bold">{formatCurrency(performance.target_amount)}</p></div>
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-slate-500">Achievement</p><p className="font-bold">{performance.sales_achievement_percent}%</p></div>
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-slate-500">Collection Rate</p><p className="font-bold">{performance.collection_rate_percent}%</p></div>
            <div className="col-span-2 rounded-lg bg-primary-50 p-3"><p className="text-slate-500">Performance Score</p><p className="text-xl font-bold text-primary-700">{performance.performance_score}</p></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
