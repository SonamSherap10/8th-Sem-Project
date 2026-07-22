import { useEffect, useState } from 'react'
import { dispatchApi } from '../../api/dispatch'
import {
  PageHeader, Button, Card, Table, Loading, EmptyState, Badge, Modal,
} from '../../components/ui'
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/format'

export default function DispatchPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [summary, setSummary] = useState(null)
  const [dispatchResult, setDispatchResult] = useState(null)
  const [dispatching, setDispatching] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const all = await dispatchApi.getConfirmedOrders()
      setOrders(all)
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const viewSummary = async (order) => {
    try {
      setSummary({ order, items: await dispatchApi.getSummary(order.id) })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleDispatch = async (orderId) => {
    setDispatching(true)
    setError('')
    setMessage('')
    try {
      const result = await dispatchApi.dispatch(orderId)
      setDispatchResult(result)
      setSummary(null)
      load()
      setMessage(`Order #${orderId} dispatched successfully`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDispatching(false)
    }
  }

  const columns = [
    { key: 'id', label: 'Order #' },
    { key: 'Retailer', label: 'Retailer', render: (r) => r.Retailer?.name || '—' },
    { key: 'SalesRep', label: 'Sales Rep', render: (r) => r.SalesRep?.name || '—' },
    { key: 'total_amount', label: 'Total', render: (r) => formatCurrency(r.total_amount) },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => viewSummary(r)}>Summary</Button>
          <Button size="sm" onClick={() => handleDispatch(r.id)} disabled={dispatching}>Dispatch</Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Dispatch Orders" description="Dispatch confirmed orders to delivery" />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
      <Card>
        {loading ? <Loading /> : orders.length ? <Table columns={columns} data={orders} /> : <EmptyState title="No confirmed orders to dispatch" />}
      </Card>

      <Modal open={!!summary} onClose={() => setSummary(null)} title={`Dispatch Summary — Order #${summary?.order?.id}`}>
        {summary && (
          <ul className="space-y-2 text-sm">
            {summary.items?.map((item) => (
              <li key={item.id} className="flex justify-between rounded bg-slate-50 px-3 py-2">
                <span>{item.Product?.name} (Batch: {item.Batch?.batch_number || 'TBD'})</span>
                <span>Qty: {item.quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal open={!!dispatchResult} onClose={() => setDispatchResult(null)} title="Dispatch Complete">
        {dispatchResult && (
          <div className="space-y-2 text-sm">
            <p>Invoice: <strong>{dispatchResult.invoice_number}</strong></p>
            <p>Delivery Person: <strong>{dispatchResult.delivery_person}</strong></p>
            <ul className="mt-3 space-y-1">
              {dispatchResult.batch_allocations?.map((a, i) => (
                <li key={i} className="rounded bg-slate-50 px-3 py-2">
                  {a.product} — Batch {a.batch_number} × {a.quantity}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  )
}
