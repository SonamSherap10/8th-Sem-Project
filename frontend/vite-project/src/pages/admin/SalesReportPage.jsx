import { useEffect, useState } from 'react'
import { BarChart3, ShoppingCart, Target, CreditCard, Users, TrendingUp } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { PageHeader, Button, Card, Table, Loading, Select, EmptyState } from '../../components/ui'
import { formatCurrency, getErrorMessage } from '../../utils/format'

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

function SummaryCard({ icon: Icon, label, value, subtext, color }) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
        </div>
      </div>
    </Card>
  )
}

export default function SalesReportPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    setLoading(true)
    setError('')
    try {
      setReport(await adminApi.getOverallSalesReport(month, year))
    } catch (err) {
      setError(getErrorMessage(err))
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  const monthLabel = MONTHS.find((m) => m.value === Number(month))?.label || month

  const columns = [
    { key: 'name', label: 'Sales Rep' },
    { key: 'order_count', label: 'Orders' },
    { key: 'total_sold', label: 'Total Sold', render: (r) => formatCurrency(r.total_sold) },
    { key: 'target_amount', label: 'Target', render: (r) => formatCurrency(r.target_amount) },
    {
      key: 'sales_achievement_percent',
      label: 'Sales %',
      render: (r) => `${r.sales_achievement_percent}%`,
    },
    { key: 'total_collected', label: 'Collected', render: (r) => formatCurrency(r.total_collected) },
    { key: 'total_due', label: 'Invoiced', render: (r) => formatCurrency(r.total_due) },
    {
      key: 'collection_rate_percent',
      label: 'Collection %',
      render: (r) => `${r.collection_rate_percent}%`,
    },
    {
      key: 'performance_score',
      label: 'Score',
      render: (r) => (
        <span className={`font-semibold ${r.performance_score >= 80 ? 'text-green-600' : r.performance_score >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
          {r.performance_score}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Overall Sales Report"
        description="Monthly sales performance across all sales representatives"
        action={
          <div className="flex flex-wrap items-end gap-3">
            <Select label="Month" value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-36">
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>
            <Select label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-28">
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
            <Button onClick={loadReport} disabled={loading}>
              <BarChart3 size={16} />
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        }
      />

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading && <Loading message="Generating sales report..." />}

      {!loading && report && (
        <div className="space-y-6">
          <Card title={`Report for ${monthLabel} ${report.year}`}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SummaryCard
                icon={ShoppingCart}
                label="Total Sales"
                value={formatCurrency(report.summary.total_sold)}
                subtext={`${report.summary.total_orders} orders`}
                color="bg-indigo-100 text-indigo-600"
              />
              <SummaryCard
                icon={Target}
                label="Total Target"
                value={formatCurrency(report.summary.total_target)}
                subtext={`${report.summary.sales_achievement_percent}% achievement`}
                color="bg-blue-100 text-blue-600"
              />
              <SummaryCard
                icon={CreditCard}
                label="Total Collected"
                value={formatCurrency(report.summary.total_collected)}
                subtext={`${report.summary.collection_rate_percent}% collection rate`}
                color="bg-green-100 text-green-600"
              />
              <SummaryCard
                icon={TrendingUp}
                label="Overall Performance"
                value={report.summary.performance_score}
                subtext="Weighted score (60% sales, 40% collection)"
                color="bg-primary-100 text-primary-600"
              />
              <SummaryCard
                icon={Users}
                label="Sales Reps"
                value={report.summary.active_sales_reps}
                subtext={`${report.summary.reps_with_sales} with sales this month`}
                color="bg-orange-100 text-orange-600"
              />
              <SummaryCard
                icon={BarChart3}
                label="Total Invoiced"
                value={formatCurrency(report.summary.total_due)}
                subtext="Invoice value for orders in period"
                color="bg-slate-100 text-slate-600"
              />
            </div>
          </Card>

          <Card title="Sales Rep Breakdown">
            {report.sales_reps.length ? (
              <Table columns={columns} data={report.sales_reps} />
            ) : (
              <EmptyState title="No sales representatives found" />
            )}
          </Card>
        </div>
      )}

      {!loading && !report && !error && (
        <Card>
          <EmptyState
            title="Select a month and year"
            description="Click Generate Report to view overall sales performance"
          />
        </Card>
      )}
    </div>
  )
}
