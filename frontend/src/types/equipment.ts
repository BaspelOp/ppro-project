export type EquipmentCategory =
  | 'SKIS'
  | 'SNOWBOARD'
  | 'BOOTS'
  | 'POLES'
  | 'BOAT'
  | 'RAFT'
  | 'PADDLE'
  | 'LIFE_JACKET'
  | 'HELMET'
  | 'OTHER';

export type EquipmentStatus = 'AVAILABLE' | 'RENTED' | 'IN_SERVICE' | 'DISCARDED';

export type EquipmentCondition = 'NEW' | 'GOOD' | 'WORN' | 'DAMAGED';

export interface EquipmentItem {
  id: number;
  inventory_number: string;
  name: string;
  category: EquipmentCategory;
  size: string;
  purchase_year: number;
  daily_rate: number;
  deposit: number;
  condition: EquipmentCondition;
  status: EquipmentStatus;
  service_notes?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentItemCreate {
  inventory_number: string;
  name: string;
  category: EquipmentCategory;
  size: string;
  purchase_year: number;
  daily_rate: number;
  deposit: number;
  condition: EquipmentCondition;
  notes?: string;
}

export interface EquipmentItemUpdate {
  name?: string;
  category?: EquipmentCategory;
  size?: string;
  purchase_year?: number;
  daily_rate?: number;
  deposit?: number;
  condition?: EquipmentCondition;
  status?: EquipmentStatus;
  notes?: string;
  service_notes?: string;
}

export interface ServiceActionPayload {
  action: 'SEND_TO_SERVICE' | 'RETURN_FROM_SERVICE';
  service_notes?: string;
  new_condition?: EquipmentCondition;
}

export interface EquipmentStats {
  total: number;
  available: number;
  rented: number;
  in_service: number;
  discarded: number;
  by_category: Record<string, number>;
}

export const CATEGORY_LABELS: Record<EquipmentCategory, { label: string; icon: string }> = {
  SKIS: { label: 'Lyže', icon: '🎿' },
  SNOWBOARD: { label: 'Snowboard', icon: '🏂' },
  BOOTS: { label: 'Boty', icon: '🥾' },
  POLES: { label: 'Hole', icon: '🥢' },
  BOAT: { label: 'Kanoe / Lodě', icon: '🛶' },
  RAFT: { label: 'Rafty', icon: '⛵' },
  PADDLE: { label: 'Pádla', icon: '🚣' },
  LIFE_JACKET: { label: 'Vesty', icon: '🦺' },
  HELMET: { label: 'Helmy', icon: '⛑️' },
  OTHER: { label: 'Ostatní', icon: '📦' },
};

export const STATUS_LABELS: Record<EquipmentStatus, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'K dispozici', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  RENTED: { label: 'Zapůjčeno', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  IN_SERVICE: { label: 'V servisu', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  DISCARDED: { label: 'Vyřazeno', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' },
};

export const CONDITION_LABELS: Record<EquipmentCondition, { label: string; color: string }> = {
  NEW: { label: 'Nové / Zánovní', color: '#10b981' },
  GOOD: { label: 'Dobré', color: '#0ea5e9' },
  WORN: { label: 'Opotřebené', color: '#f59e0b' },
  DAMAGED: { label: 'Poškozené', color: '#ef4444' },
};
