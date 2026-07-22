import { useEffect, useState } from 'react'
import { Truck, CheckCircle, Navigation } from 'lucide-react'
import { deliveryApi } from '../../api/deliveries'
import { PageHeader, Button, Card, Badge, Loading, EmptyState, Select } from '../../components/ui'
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/format'

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      setDeliveries(await deliveryApi.getAll(params))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const markInTransit = async (id) => {
    setUpdating(id)
    try {
      await deliveryApi.markInTransit(id)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUpdating(null)
    }
  }

  const markDelivered = async (id) => {
    setUpdating(id)
    try {
      await deliveryApi.markDelivered(id)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="My Deliveries"
        description="Track and update your assigned deliveries"
        action={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </Select>
        }
      />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <Loading />
      ) : deliveries.length === 0 ? (
        <EmptyState title="No deliveries assigned" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {deliveries.map((d) => (
            <Card key={d.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{d.retailer_name || 'Retailer'}</p>
                    <p className="text-sm text-slate-500">Order total: {formatCurrency(d.order_total)}</p>
                  </div>
                </div>
                <Badge status={d.status} />
              </div>

              <div className="mt-4 space-y-1 text-sm text-slate-600">
                {d.dispatched_at && <p>Dispatched: {formatDate(d.dispatched_at)}</p>}
                {d.delivered_at && <p>Delivered: {formatDate(d.delivered_at)}</p>}
              </div>

              <div className="mt-4 flex gap-2">
                {d.status === 'assigned' && (
                  <Button size="sm" className="flex-1" onClick={() => markInTransit(d.id)} disabled={updating === d.id}>
                    <Navigation size={14} />
                    {updating === d.id ? 'Updating...' : 'Start Transit'}
                  </Button>
                )}
                {d.status === 'in_transit' && (
                  <Button size="sm" variant="success" className="flex-1" onClick={() => markDelivered(d.id)} disabled={updating === d.id}>
                    <CheckCircle size={14} />
                    {updating === d.id ? 'Updating...' : 'Mark Delivered'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
