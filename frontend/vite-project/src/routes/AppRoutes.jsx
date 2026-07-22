import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME, ROLES } from '../utils/constants'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '../components/layout/AppLayout'

import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import UnauthorizedPage from '../pages/UnauthorizedPage'

import AdminDashboard from '../pages/admin/AdminDashboard'
import UsersPage from '../pages/admin/UsersPage'
import ProductsPage from '../pages/admin/ProductsPage'
import RetailersPage from '../pages/admin/RetailersPage'
import RegionsPage from '../pages/admin/RegionsPage'
import AdminOrdersPage from '../pages/admin/AdminOrdersPage'
import SalesTargetsPage from '../pages/admin/SalesTargetsPage'
import AlertsPage from '../pages/admin/AlertsPage'

import InvoicesPage from '../pages/shared/InvoicesPage'
import InventoryPage, { ReceiveStockPage } from '../pages/shared/InventoryPage'

import SalesDashboard from '../pages/sales/SalesDashboard'
import MyRetailersPage from '../pages/sales/MyRetailersPage'
import OrdersPage from '../pages/sales/OrdersPage'
import CreateOrderPage from '../pages/sales/CreateOrderPage'
import PaymentsPage from '../pages/sales/PaymentsPage'
import CreateReturnPage from '../pages/sales/CreateReturnPage'

import WarehouseDashboard from '../pages/warehouse/WarehouseDashboard'
import DispatchPage from '../pages/warehouse/DispatchPage'
import ProcessReturnsPage from '../pages/warehouse/ProcessReturnsPage'

import DeliveriesPage from '../pages/delivery/DeliveriesPage'

function RootRedirect() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/products" element={<ProductsPage />} />
          <Route path="/admin/retailers" element={<RetailersPage />} />
          <Route path="/admin/regions" element={<RegionsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/invoices" element={<InvoicesPage />} />
          <Route path="/admin/sales-targets" element={<SalesTargetsPage />} />
          <Route path="/admin/inventory" element={<InventoryPage canAdjust />} />
          <Route path="/admin/alerts" element={<AlertsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.SALES_REP]} />}>
        <Route element={<AppLayout />}>
          <Route path="/sales" element={<SalesDashboard />} />
          <Route path="/sales/retailers" element={<MyRetailersPage />} />
          <Route path="/sales/orders" element={<OrdersPage />} />
          <Route path="/sales/orders/new" element={<CreateOrderPage />} />
          <Route path="/sales/invoices" element={<InvoicesPage />} />
          <Route path="/sales/payments" element={<PaymentsPage />} />
          <Route path="/sales/returns" element={<CreateReturnPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.WAREHOUSE]} />}>
        <Route element={<AppLayout />}>
          <Route path="/warehouse" element={<WarehouseDashboard />} />
          <Route path="/warehouse/inventory" element={<InventoryPage />} />
          <Route path="/warehouse/receive" element={<ReceiveStockPage />} />
          <Route path="/warehouse/dispatch" element={<DispatchPage />} />
          <Route path="/warehouse/returns" element={<ProcessReturnsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.DELIVERY]} />}>
        <Route element={<AppLayout />}>
          <Route path="/delivery" element={<DeliveriesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
