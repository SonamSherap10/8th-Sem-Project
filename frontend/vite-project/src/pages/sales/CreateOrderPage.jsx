import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { orderApi } from '../../api/orders'
import { productApi } from '../../api/products'
import { PageHeader, Button, Card, Input, Select } from '../../components/ui'
import { formatCurrency, getErrorMessage } from '../../utils/format'

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const [retailers, setRetailers] = useState([])
  const [products, setProducts] = useState([])
  const [retailerId, setRetailerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: '', unit_price: '' }])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([orderApi.getMyRetailers(), productApi.getAll({ is_active: 'true' })])
      .then(([r, p]) => { setRetailers(r); setProducts(p) })
      .catch(() => {})
  }, [])

  const addItem = () => setItems([...items, { product_id: '', quantity: '', unit_price: '' }])
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i, field, value) => {
    const next = [...items]
    next[i] = { ...next[i], [field]: value }
    if (field === 'product_id') {
      const product = products.find((p) => p.id === Number(value))
      if (product) next[i].unit_price = product.price
    }
    setItems(next)
  }

  const total = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price) || 0), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await orderApi.create({
        retailer_id: Number(retailerId),
        items: items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
      })
      navigate('/sales/orders')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="New Order" description="Create an order for a retailer" />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select label="Retailer" value={retailerId} onChange={(e) => setRetailerId(e.target.value)} required className="max-w-md">
            <option value="">Select retailer</option>
            {retailers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (Balance: {formatCurrency(r.current_balance)} / {formatCurrency(r.credit_limit)})
              </option>
            ))}
          </Select>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-slate-900">Order Items</h3>
              <Button type="button" variant="secondary" size="sm" onClick={addItem}><Plus size={14} /> Add Item</Button>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 p-4">
                  <Select label="Product" value={item.product_id} onChange={(e) => updateItem(i, 'product_id', e.target.value)} className="min-w-48 flex-1" required>
                    <option value="">Select product</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}</option>)}
                  </Select>
                  <Input label="Qty" type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} className="w-24" required />
                  <Input label="Unit Price" type="number" step="0.01" value={item.unit_price} onChange={(e) => updateItem(i, 'unit_price', e.target.value)} className="w-32" required />
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}><Trash2 size={16} /></Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-lg font-bold">Total: {formatCurrency(total)}</p>
            <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Order'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
