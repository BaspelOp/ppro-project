import { EquipmentCondition } from './equipment';

export type ActiveTab = 'equipment' | 'rentals' | 'customers' | 'categories';

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
