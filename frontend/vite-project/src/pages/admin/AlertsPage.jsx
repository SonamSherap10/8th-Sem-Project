import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { alertApi } from '../../api/alerts'
import {
  PageHeader, Button, Card, Table, Loading, EmptyState, Badge, Select,
} from '../../components/ui'
import { formatDate, capitalize, getErrorMessage } from '../../utils/format'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [readFilter, setReadFilter] = useState('false')
  const [checking, setChecking] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (typeFilter) params.type = typeFilter
      if (readFilter) params.is_read = readFilter
      setAlerts(await alertApi.getAll(params))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [typeFilter, readFilter])

  const runChecks = async () => {
    setChecking(true)
    try {
      await Promise.all([
        alertApi.checkExpiry(),
        alertApi.checkLowStock(),
        alertApi.checkOverdue(),
      ])
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setChecking(false)
    }
  }

  const markRead = async (id) => {
    try {
      await alertApi.markRead(id)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const columns = [
    { key: 'type', label: 'Type', render: (r) => <Badge status={r.type}>{capitalize(r.type)}</Badge> },
    { key: 'message', label: 'Message' },
    { key: 'reference_name', label: 'Reference', render: (r) => r.reference_name || '—' },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => !r.is_read && (
        <Button size="sm" variant="secondary" onClick={() => markRead(r.id)}>Mark Read</Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Alerts"
        description="System alerts for expiry, stock, and overdue payments"
        action={
          <div className="flex gap-2">
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40">
              <option value="">All Types</option>
              <option value="near_expiry">Near Expiry</option>
              <option value="low_stock">Low Stock</option>
              <option value="overdue_payment">Overdue Payment</option>
            </Select>
            <Select value={readFilter} onChange={(e) => setReadFilter(e.target.value)} className="w-36">
              <option value="">All</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </Select>
            <Button onClick={runChecks} disabled={checking}>
              <RefreshCw size={16} />
              {checking ? 'Checking...' : 'Run Checks'}
            </Button>
          </div>
        }
      />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Card>
        {loading ? <Loading /> : alerts.length ? <Table columns={columns} data={alerts} /> : <EmptyState title="No alerts" />}
      </Card>
    </div>
  )
}
