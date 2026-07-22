import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Boxes, RotateCcw } from 'lucide-react'
import { batchApi } from '../../api/batches'
import { returnApi } from '../../api/returns'
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
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function WarehouseDashboard() {
  const [stats, setStats] = useState({ lowStock: 0, expiring: 0, pendingReturns: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [low, expiring, returns] = await Promise.all([
          batchApi.getAll({ low_stock: 'true' }),
          batchApi.getAll({ expiring_soon: 'true' }),
          returnApi.getPending(),
        ])
        setStats({ lowStock: low?.length ?? 0, expiring: expiring?.length ?? 0, pendingReturns: returns?.length ?? 0 })
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
      <PageHeader title="Warehouse Dashboard" description="Inventory and fulfillment overview" />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Boxes} label="Low Stock Batches" value={stats.lowStock} to="/warehouse/inventory" color="bg-red-100 text-red-600" />
        <StatCard icon={Boxes} label="Expiring Soon" value={stats.expiring} to="/warehouse/inventory" color="bg-orange-100 text-orange-600" />
        <StatCard icon={RotateCcw} label="Pending Returns" value={stats.pendingReturns} to="/warehouse/returns" color="bg-indigo-100 text-indigo-600" />
      </div>
    </div>
  )
}
