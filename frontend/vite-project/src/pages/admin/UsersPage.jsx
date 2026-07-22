import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { adminApi } from '../../api/admin'
import {
  PageHeader, Button, Card, Table, Loading, EmptyState, Modal, Input, Select, Badge,
} from '../../components/ui'
import { ROLE_LABELS } from '../../utils/constants'
import { getErrorMessage } from '../../utils/format'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = roleFilter ? { role: roleFilter } : {}
      setUsers(await adminApi.getUsers(params))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [roleFilter])

  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, role: user.role, region_id: user.region_id || '' })
    setModal({ type: 'edit', user })
  }

  const openPassword = (user) => {
    setForm({ new_password: '' })
    setModal({ type: 'password', user })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal.type === 'edit') {
        await adminApi.updateUser(modal.user.id, {
          name: form.name,
          email: form.email,
          role: form.role,
          region_id: form.region_id ? Number(form.region_id) : null,
        })
      } else if (modal.type === 'password') {
        await adminApi.changePassword(modal.user.id, form.new_password)
      }
      setModal(null)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (user) => {
    try {
      if (user.is_active) await adminApi.deactivateUser(user.id)
      else await adminApi.activateUser(user.id)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => ROLE_LABELS[r.role] || r.role },
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
          <Button size="sm" variant="secondary" onClick={() => openPassword(r)}>Reset PW</Button>
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
        title="Users"
        description="Manage system users and roles"
        action={
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-40">
            <option value="">All Roles</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        }
      />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Card>
        {loading ? <Loading /> : users.length ? <Table columns={columns} data={users} /> : <EmptyState title="No users found" />}
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.type === 'password' ? 'Reset Password' : 'Edit User'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </>
        }
      >
        {modal?.type === 'edit' && (
          <div className="space-y-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {Object.entries(ROLE_LABELS).filter(([k]) => k !== 'admin').map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
              <option value="admin">Admin</option>
            </Select>
            <Input label="Region ID" type="number" value={form.region_id} onChange={(e) => setForm({ ...form, region_id: e.target.value })} />
          </div>
        )}
        {modal?.type === 'password' && (
          <Input label="New Password" type="password" value={form.new_password} onChange={(e) => setForm({ new_password: e.target.value })} />
        )}
      </Modal>
    </div>
  )
}
