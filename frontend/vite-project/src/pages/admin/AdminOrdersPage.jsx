import { useEffect, useState } from 'react'
import { adminApi } from '../../api/admin'
import { PageHeader, Card, Table, Loading, EmptyState, Badge, Modal } from '../../components/ui'
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/format'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setOrders(await adminApi.getAllOrders())
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const viewOrder = async (order) => {
    try {
      setSelected(await adminApi.getOrder(order.id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const columns = [
    { key: 'id', label: 'Order #' },
    { key: 'Retailer', label: 'Retailer', render: (r) => r.Retailer?.name || '—' },
    { key: 'SalesRep', label: 'Sales Rep', render: (r) => r.SalesRep?.name || '—' },
    { key: 'total_amount', label: 'Total', render: (r) => formatCurrency(r.total_amount) },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
  ]

  return (
    <div>
      <PageHeader title="Orders" description="All orders across the system" />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Card>
        {loading ? (
          <Loading />
        ) : orders.length ? (
          <Table columns={columns} data={orders} onRowClick={viewOrder} />
        ) : (
          <EmptyState title="No orders found" />
        )}
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order #${selected?.id}`}>
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-slate-500">Retailer:</span> {selected.Retailer?.name}</div>
              <div><span className="text-slate-500">Sales Rep:</span> {selected.SalesRep?.name}</div>
              <div><span className="text-slate-500">Status:</span> <Badge status={selected.status} /></div>
              <div><span className="text-slate-500">Total:</span> {formatCurrency(selected.total_amount)}</div>
            </div>
            <div>
              <p className="mb-2 font-medium">Items</p>
              <ul className="space-y-1">
                {selected.OrderItems?.map((item) => (
                  <li key={item.id} className="flex justify-between rounded bg-slate-50 px-3 py-2">
                    <span>{item.Product?.name || `Product ${item.product_id}`}</span>
                    <span>{item.quantity} × {formatCurrency(item.unit_price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
