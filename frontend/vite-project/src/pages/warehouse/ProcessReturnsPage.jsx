import { useEffect, useState } from 'react'
import { returnApi } from '../../api/returns'
import {
  PageHeader, Button, Card, Table, Loading, EmptyState, Badge, Modal, Select,
} from '../../components/ui'
import { WAREHOUSE_ACTIONS } from '../../utils/constants'
import { capitalize, formatDate, getErrorMessage } from '../../utils/format'

export default function ProcessReturnsPage() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState('restocked')
  const [processing, setProcessing] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setReturns(await returnApi.getPending())
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleProcess = async () => {
    setProcessing(true)
    try {
      await returnApi.process(selected.id, { warehouse_action: action })
      setSelected(null)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  const columns = [
    { key: 'id', label: 'Return #' },
    { key: 'Retailer', label: 'Retailer', render: (r) => r.Retailer?.name || '—' },
    { key: 'SalesRep', label: 'Sales Rep', render: (r) => r.SalesRep?.name || '—' },
    { key: 'reason', label: 'Reason', render: (r) => <Badge status={r.reason}>{capitalize(r.reason)}</Badge> },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => <Button size="sm" onClick={() => { setSelected(r); setAction('restocked') }}>Process</Button>,
    },
  ]

  return (
    <div>
      <PageHeader title="Pending Returns" description="Process returned items from sales reps" />
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Card>
        {loading ? <Loading /> : returns.length ? <Table columns={columns} data={returns} /> : <EmptyState title="No pending returns" />}
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Process Return #${selected?.id}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleProcess} disabled={processing}>{processing ? 'Processing...' : 'Confirm'}</Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Reason: {capitalize(selected.reason)}</p>
            <ul className="space-y-1 text-sm">
              {selected.ReturnItems?.map((item) => (
                <li key={item.id} className="rounded bg-slate-50 px-3 py-2">
                  {item.Product?.name} × {item.quantity}
                </li>
              ))}
            </ul>
            <Select label="Warehouse Action" value={action} onChange={(e) => setAction(e.target.value)}>
              {WAREHOUSE_ACTIONS.map((a) => <option key={a} value={a}>{capitalize(a)}</option>)}
            </Select>
          </div>
        )}
      </Modal>
    </div>
  )
}
