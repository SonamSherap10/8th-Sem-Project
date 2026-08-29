import {
  LayoutDashboard,
  Users,
  Package,
  Store,
  MapPin,
  ShoppingCart,
  FileText,
  Target,
  BarChart3,
  Boxes,
  Bell,
  Truck,
  CreditCard,
  RotateCcw,
  ClipboardList,
  PlusCircle,
} from 'lucide-react'
import { ROLES } from '../../utils/constants'

export const NAV_ITEMS = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Retailers', path: '/admin/retailers', icon: Store },
    { label: 'Regions', path: '/admin/regions', icon: MapPin },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Invoices', path: '/admin/invoices', icon: FileText },
    { label: 'Sales Targets', path: '/admin/sales-targets', icon: Target },
    { label: 'Sales Report', path: '/admin/sales-report', icon: BarChart3 },
    { label: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { label: 'Alerts', path: '/admin/alerts', icon: Bell },
  ],
  [ROLES.SALES_REP]: [
    { label: 'Dashboard', path: '/sales', icon: LayoutDashboard },
    { label: 'Retailers', path: '/sales/retailers', icon: Store },
    { label: 'Orders', path: '/sales/orders', icon: ShoppingCart },
    { label: 'New Order', path: '/sales/orders/new', icon: PlusCircle },
    { label: 'Invoices', path: '/sales/invoices', icon: FileText },
    { label: 'Payments', path: '/sales/payments', icon: CreditCard },
    { label: 'Returns', path: '/sales/returns', icon: RotateCcw },
  ],
  [ROLES.WAREHOUSE]: [
    { label: 'Dashboard', path: '/warehouse', icon: LayoutDashboard },
    { label: 'Inventory', path: '/warehouse/inventory', icon: Boxes },
    { label: 'Receive Stock', path: '/warehouse/receive', icon: Package },
    { label: 'Dispatch', path: '/warehouse/dispatch', icon: ClipboardList },
    { label: 'Returns', path: '/warehouse/returns', icon: RotateCcw },
  ],
  [ROLES.DELIVERY]: [
    { label: 'My Deliveries', path: '/delivery', icon: Truck },
  ],
}
