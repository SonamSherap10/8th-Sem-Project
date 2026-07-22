import { useEffect, useState } from 'react'
import { invoiceApi } from '../../api/invoices'
import { PageHeader, Card, Table, Loading, EmptyState, Badge, Select, Modal } from '../../components/ui'
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/format'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      setInvoices(await invoiceApi.getAll(params))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const viewInvoice = async (invoice) => {
    try {
      setSelected(await invoiceApi.getById(invoice.id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const columns = [
    { key: 'invoice_number', label: 'Invoice #' },
    { key: 'retailer_name', label: 'Retailer', render: (r) => r.retailer_name || '—' },
    { key: 'sales_rep_name', label: 'Sales Rep', render: (r) => r.sales_rep_name || '—' },
    { key: 'total_amount', label: 'Amount', render: (r) => formatCurrency(r.total_amount) },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'due_date', label: 'Due', render: (r) => formatDate(r.due_date) },
  ]

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="View and track invoices"
        action={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="">All Statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </Select>
        }
      />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Card>
        {loading ? <Loading /> : invoices.length ? <Table columns={columns} data={invoices} onRowClick={viewInvoice} /> : <EmptyState title="No invoices found" />}
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Invoice ${selected?.invoice_number}`}>
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-slate-500">Amount:</span> {formatCurrency(selected.total_amount)}</div>
              <div><span className="text-slate-500">Paid:</span> {formatCurrency(selected.amount_paid)}</div>
              <div><span className="text-slate-500">Status:</span> <Badge status={selected.status} /></div>
              <div><span className="text-slate-500">Due:</span> {formatDate(selected.due_date)}</div>
            </div>
            {selected.Payments?.length > 0 && (
              <div>
                <p className="mb-2 font-medium">Payments</p>
                <ul className="space-y-1">
                  {selected.Payments.map((p) => (
                    <li key={p.id} className="flex justify-between rounded bg-slate-50 px-3 py-2">
                      <span>{p.method}</span>
                      <span>{formatCurrency(p.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
