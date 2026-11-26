import { EquipmentCondition } from './equipment';

export type ActiveTab = 'equipment' | 'rentals' | 'customers' | 'categories' | 'reports';

export type RentalStatus =
  | 'RESERVED'
  | 'ACTIVE'
  | 'PARTIALLY_RETURNED'
  | 'RETURNED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Category {
  id: number;
  code: string;
  name: string;
  default_daily_rate: number;
  default_deposit: number;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryUpdate {
  name?: string;
  default_daily_rate?: number;
  default_deposit?: number;
  description?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  id_card_number: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreate {
  name: string;
  phone: string;
  email?: string;
  id_card_number: string;
  notes?: string;
}

export interface RentalItemEquipmentSummary {
  id: number;
  inventory_number: string;
  name: string;
  category: string;
  size: string;
  status: string;
}

export interface RentalItem {
  id: number;
  rental_id: number;
  equipment_item_id: number;
  agreed_daily_rate: number;
  agreed_deposit: number;
  returned_at?: string | null;
  late_penalty: number;
  item_return_condition?: EquipmentCondition | null;
  notes?: string | null;
  equipment_item?: RentalItemEquipmentSummary | null;
}

export interface Rental {
  id: number;
  customer_id: number;
  rental_start: string;
  rental_end: string;
  total_deposit: number;
  discount_amount: number;
  total_price: number;
  tariff_type: string;
  status: RentalStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer | null;
  items: RentalItem[];
}

export interface RentalCreate {
  customer_id: number;
  equipment_item_ids: number[];
  rental_start: string;
  rental_end: string;
  is_reservation: boolean;
  discount_amount: number;
  notes?: string;
}

export interface ReturnItemPayload {
  returned_at?: string;
  item_return_condition: EquipmentCondition;
  send_to_service: boolean;
  notes?: string;
}

export interface ServiceRecord {
  id: number;
  equipment_item_id: number;
  service_start: string;
  service_end?: string | null;
  issue_description: string;
  resolution_notes?: string | null;
  cost: number;
  created_at: string;
}

export const RENTAL_STATUS_LABELS: Record<
  RentalStatus,
  { label: string; color: string; bg: string }
> = {
  RESERVED: { label: 'Rezervace', color: '#854d0e', bg: '#fef9c3' },
  ACTIVE: { label: 'Aktivní výpůjčka', color: '#0369a1', bg: '#e0f2fe' },
  PARTIALLY_RETURNED: { label: 'Částečně vráceno', color: '#b45309', bg: '#ffedd5' },
  RETURNED: { label: 'Vráceno / Uzavřeno', color: '#15803d', bg: '#dcfce7' },
  CANCELLED: { label: 'Stornováno', color: '#57534e', bg: '#f5f5f4' },
  EXPIRED: { label: 'Expirováno', color: '#991b1b', bg: '#fee2e2' },
};

export interface ActiveRentedItemReport {
  rental_id: number;
  rental_item_id: number;
  equipment_item_id: number;
  inventory_number: string;
  equipment_name: string;
  category: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  rental_start: string;
  rental_end: string;
  agreed_daily_rate: number;
  is_overdue: boolean;
  overdue_days: number;
  estimated_penalty: number;
}

export interface ActiveOverdueSummary {
  active_rentals_count: number;
  active_items_count: number;
  overdue_items_count: number;
  total_estimated_penalty: number;
  items: ActiveRentedItemReport[];
}

export interface EquipmentUtilizationItem {
  equipment_item_id: number;
  inventory_number: string;
  name: string;
  category: string;
  status: string;
  rental_count: number;
  total_rented_days: number;
  total_revenue: number;
  service_count: number;
  total_service_cost: number;
}

export interface CategoryUtilizationItem {
  category: string;
  total_items: number;
  available_items: number;
  rented_items: number;
  in_service_items: number;
  total_rentals: number;
  total_revenue: number;
  occupancy_pct: number;
}

export interface UtilizationReport {
  by_category: CategoryUtilizationItem[];
  by_equipment: EquipmentUtilizationItem[];
}

export interface ProtocolItem {
  inventory_number: string;
  name: string;
  size: string;
  agreed_daily_rate: number;
  agreed_deposit: number;
  returned_at?: string | null;
  late_penalty: number;
  item_return_condition?: string | null;
}

export interface RentalProtocol {
  protocol_number: string;
  generated_at: string;
  provider_name: string;
  provider_address: string;
  rental_id: number;
  status: string;
  tariff_type: string;
  rental_start: string;
  rental_end: string;
  billing_days: number;
  customer_name: string;
  customer_phone: string;
  customer_id_card: string;
  customer_email?: string | null;
  total_deposit: number;
  discount_amount: number;
  total_price: number;
  total_penalties: number;
  notes?: string | null;
  items: ProtocolItem[];
}
