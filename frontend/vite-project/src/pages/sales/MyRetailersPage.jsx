import { useEffect, useState } from 'react'
import { orderApi } from '../../api/orders'
import { PageHeader, Card, Table, Loading, EmptyState } from '../../components/ui'
import { formatCurrency, getErrorMessage } from '../../utils/format'

export default function MyRetailersPage() {
  const [retailers, setRetailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    orderApi.getMyRetailers()
      .then(setRetailers)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'contact_person', label: 'Contact', render: (r) => r.contact_person || '—' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || '—' },
    { key: 'credit_limit', label: 'Credit Limit', render: (r) => formatCurrency(r.credit_limit) },
    { key: 'current_balance', label: 'Balance', render: (r) => formatCurrency(r.current_balance) },
  ]

  return (
    <div>
      <PageHeader title="My Retailers" description="Active retailers in your region" />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Card>
        {loading ? <Loading /> : retailers.length ? <Table columns={columns} data={retailers} /> : <EmptyState title="No retailers in your region" />}
      </Card>
    </div>
  )
}
