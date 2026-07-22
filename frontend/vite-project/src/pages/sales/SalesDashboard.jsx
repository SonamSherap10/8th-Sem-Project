import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, ShoppingCart, CreditCard } from 'lucide-react'
import { orderApi } from '../../api/orders'
import { paymentApi } from '../../api/payments'
import { PageHeader, Card, Loading } from '../../components/ui'
import { formatCurrency, getErrorMessage } from '../../utils/format'

function StatCard({ icon: Icon, label, value, to, color }) {
  return (
    <Link to={to} className="block">
      <Card className="transition hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
            <Icon size={22} />
          </div>
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function SalesDashboard() {
  const [stats, setStats] = useState({ retailers: 0, orders: 0, collections: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [retailers, orders, collections] = await Promise.all([
          orderApi.getMyRetailers(),
          orderApi.getAll(),
          paymentApi.getMyCollections(),
        ])
        setStats({
          retailers: retailers?.length ?? 0,
          orders: orders?.length ?? 0,
          collections: collections?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0,
        })
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Loading />

  return (
    <div>
      <PageHeader title="Sales Dashboard" description="Your sales overview" />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Store} label="My Retailers" value={stats.retailers} to="/sales/retailers" color="bg-blue-100 text-blue-600" />
        <StatCard icon={ShoppingCart} label="My Orders" value={stats.orders} to="/sales/orders" color="bg-indigo-100 text-indigo-600" />
        <StatCard icon={CreditCard} label="Total Collected" value={formatCurrency(stats.collections)} to="/sales/payments" color="bg-green-100 text-green-600" />
      </div>
    </div>
  )
}
