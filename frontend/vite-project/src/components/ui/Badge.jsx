import { STATUS_COLORS } from '../../utils/constants'
import { capitalize } from '../../utils/format'

export default function Badge({ status, children }) {
  const value = children || status
  const color = STATUS_COLORS[status] || 'bg-slate-100 text-slate-700'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {capitalize(String(value))}
    </span>
  )
}
