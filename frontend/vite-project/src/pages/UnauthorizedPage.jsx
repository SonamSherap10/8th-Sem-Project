import { Link } from 'react-router-dom'
import { Button, Card } from '../components/ui'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md text-center">
        <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-500">You do not have permission to view this page.</p>
        <Link to="/login">
          <Button className="mt-4">Back to Login</Button>
        </Link>
      </Card>
    </div>
  )
}
