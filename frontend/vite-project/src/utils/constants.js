export const ROLES = {
  ADMIN: 'admin',
  SALES_REP: 'sales_rep',
  WAREHOUSE: 'warehouse',
  DELIVERY: 'delivery',
}

export const ROLE_HOME = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.SALES_REP]: '/sales',
  [ROLES.WAREHOUSE]: '/warehouse',
  [ROLES.DELIVERY]: '/delivery',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.SALES_REP]: 'Sales Rep',
  [ROLES.WAREHOUSE]: 'Warehouse',
  [ROLES.DELIVERY]: 'Delivery',
}

export const ORDER_STATUSES = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled']
export const INVOICE_STATUSES = ['unpaid', 'partial', 'paid']
export const DELIVERY_STATUSES = ['assigned', 'in_transit', 'delivered']
export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'cheque']
export const RETURN_REASONS = ['damaged', 'expired', 'wrong_product', 'overstock']
export const WAREHOUSE_ACTIONS = ['restocked', 'written_off']
export const ALERT_TYPES = ['near_expiry', 'low_stock', 'overdue_payment']

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  dispatched: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  unpaid: 'bg-red-100 text-red-800',
  partial: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  processed: 'bg-green-100 text-green-800',
  near_expiry: 'bg-orange-100 text-orange-800',
  low_stock: 'bg-red-100 text-red-800',
  overdue_payment: 'bg-yellow-100 text-yellow-800',
}
