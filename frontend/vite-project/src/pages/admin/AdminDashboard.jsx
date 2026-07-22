import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Package, ShoppingCart, Bell } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { alertApi } from '../../api/alerts'
import { PageHeader, Card, Loading } from '../../components/ui'
import { getErrorMessage } from '../../utils/format'

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
            <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, alerts: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [users, products, orders, alerts] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getProducts(),
          adminApi.getAllOrders(),
          alertApi.getAll({ is_read: 'false' }),
        ])
        setStats({
          users: users?.length ?? 0,
          products: products?.length ?? 0,
          orders: orders?.length ?? 0,
          alerts: alerts?.length ?? 0,
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
      <PageHeader title="Admin Dashboard" description="Overview of your distribution system" />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={stats.users} to="/admin/users" color="bg-blue-100 text-blue-600" />
        <StatCard icon={Package} label="Products" value={stats.products} to="/admin/products" color="bg-green-100 text-green-600" />
        <StatCard icon={ShoppingCart} label="Orders" value={stats.orders} to="/admin/orders" color="bg-indigo-100 text-indigo-600" />
        <StatCard icon={Bell} label="Unread Alerts" value={stats.alerts} to="/admin/alerts" color="bg-orange-100 text-orange-600" />
      </div>
    </div>
  )
}
