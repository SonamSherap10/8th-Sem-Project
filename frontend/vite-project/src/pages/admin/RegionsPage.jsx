import { useState } from 'react'
import { Plus } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { PageHeader, Button, Card, Input, Textarea } from '../../components/ui'
import { getErrorMessage } from '../../utils/format'

export default function RegionsPage() {
  const [form, setForm] = useState({ name: '', description: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const region = await adminApi.createRegion(form)
      setMessage(`Region "${region.name}" created successfully (ID: ${region.id})`)
      setForm({ name: '', description: '' })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Regions" description="Create geographic regions for users and retailers" />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
      <Card title="Create Region">
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <Input label="Region Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button type="submit" disabled={saving}>
            <Plus size={16} />
            {saving ? 'Creating...' : 'Create Region'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
