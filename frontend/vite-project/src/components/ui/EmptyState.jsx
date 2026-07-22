export default function EmptyState({ title, description }) {
  return (
    <div className="py-12 text-center">
      <p className="text-base font-medium text-slate-900">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  )
}
