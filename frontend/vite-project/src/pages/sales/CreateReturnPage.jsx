import { useEffect, useState } from 'react'
import { orderApi } from '../../api/orders'
import { returnApi } from '../../api/returns'
import { Plus, Trash2 } from 'lucide-react'
import {
  PageHeader, Button, Card, Input, Select, Table, Loading, EmptyState,
} from '../../components/ui'
import { RETURN_REASONS } from '../../utils/constants'
import { capitalize, getErrorMessage } from '../../utils/format'

export default function CreateReturnPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [orderId, setOrderId] = useState('')
  const [reason, setReason] = useState('damaged')
  const [items, setItems] = useState([{ product_id: '', quantity: '' }])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    orderApi.getAll({ status: 'delivered' })
      .then(setOrders)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (orderId) {
      orderApi.getById(orderId).then((order) => {
        setSelectedOrder(order)
        setItems(order.OrderItems?.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          batch_id: item.batch_id || '',
        })) || [{ product_id: '', quantity: '' }])
      }).catch(() => {})
    }
  }, [orderId])

  const addItem = () => setItems([...items, { product_id: '', quantity: '' }])
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i, field, value) => {
    const next = [...items]
    next[i] = { ...next[i], [field]: value }
    setItems(next)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await returnApi.create({
        order_id: Number(orderId),
        reason,
        items: items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          ...(item.batch_id ? { batch_id: Number(item.batch_id) } : {}),
        })),
      })
      setMessage('Return submitted successfully')
      setOrderId('')
      setItems([{ product_id: '', quantity: '' }])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Returns" description="Create a return for a delivered order" />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
      <Card>
        {loading ? <Loading /> : (
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
            <Select label="Delivered Order" value={orderId} onChange={(e) => setOrderId(e.target.value)} required>
              <option value="">Select order</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>Order #{o.id} — {o.Retailer?.name}</option>
              ))}
            </Select>
            <Select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              {RETURN_REASONS.map((r) => <option key={r} value={r}>{capitalize(r)}</option>)}
            </Select>

            {selectedOrder && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">Return Items</h3>
                  <Button type="button" variant="secondary" size="sm" onClick={addItem}><Plus size={14} /> Add</Button>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="mb-2 flex gap-3 rounded border border-slate-200 p-3">
                    <Select value={item.product_id} onChange={(e) => updateItem(i, 'product_id', e.target.value)} className="flex-1" required>
                      <option value="">Product</option>
                      {selectedOrder.OrderItems?.map((oi) => (
                        <option key={oi.product_id} value={oi.product_id}>{oi.Product?.name}</option>
                      ))}
                    </Select>
                    <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} className="w-24" required />
                    {items.length > 1 && (
                      <Button type="button" variant="ghost" onClick={() => removeItem(i)}><Trash2 size={16} /></Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" disabled={saving || !orderId}>{saving ? 'Submitting...' : 'Submit Return'}</Button>
          </form>
        )}
      </Card>
    </div>
  )
}
