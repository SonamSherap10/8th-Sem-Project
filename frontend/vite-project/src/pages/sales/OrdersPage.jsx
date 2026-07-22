import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { orderApi } from '../../api/orders'
import { PageHeader, Button, Card, Table, Loading, EmptyState, Badge, Modal, Select } from '../../components/ui'
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/format'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      setOrders(await orderApi.getAll(params))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const viewOrder = async (order) => {
    try {
      setSelected(await orderApi.getById(order.id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const cancelOrder = async (id) => {
    try {
      await orderApi.cancel(id)
      setSelected(null)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const columns = [
    { key: 'id', label: 'Order #' },
    { key: 'Retailer', label: 'Retailer', render: (r) => r.Retailer?.name || '—' },
    { key: 'total_amount', label: 'Total', render: (r) => formatCurrency(r.total_amount) },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
  ]

  return (
    <div>
      <PageHeader
        title="My Orders"
        description="Orders you have created"
        action={
          <div className="flex gap-2">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Link to="/sales/orders/new"><Button><Plus size={16} /> New Order</Button></Link>
          </div>
        }
      />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Card>
        {loading ? <Loading /> : orders.length ? <Table columns={columns} data={orders} onRowClick={viewOrder} /> : <EmptyState title="No orders yet" />}
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order #${selected?.id}`}
        footer={selected?.status === 'pending' && (
          <Button variant="danger" onClick={() => cancelOrder(selected.id)}>Cancel Order</Button>
        )}
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-slate-500">Retailer:</span> {selected.Retailer?.name}</div>
              <div><span className="text-slate-500">Status:</span> <Badge status={selected.status} /></div>
              <div><span className="text-slate-500">Total:</span> {formatCurrency(selected.total_amount)}</div>
            </div>
            {selected.status === 'confirmed' && (
              <p className="rounded-lg bg-yellow-50 px-3 py-2 text-yellow-800">
                Orders are created as confirmed. Cancellation is only available for pending orders.
              </p>
            )}
            <ul className="space-y-1">
              {selected.OrderItems?.map((item) => (
                <li key={item.id} className="flex justify-between rounded bg-slate-50 px-3 py-2">
                  <span>{item.Product?.name}</span>
                  <span>{item.quantity} × {formatCurrency(item.unit_price)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  )
}
