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

export const CATEGORY_LABELS: Record<EquipmentCategory, { label: string; key: EquipmentCategory }> = {
  SKIS: { label: 'Lyže', key: 'SKIS' },
  SNOWBOARD: { label: 'Snowboard', key: 'SNOWBOARD' },
  BOOTS: { label: 'Boty', key: 'BOOTS' },
  POLES: { label: 'Hole', key: 'POLES' },
  BOAT: { label: 'Kanoe a lodě', key: 'BOAT' },
  RAFT: { label: 'Rafty', key: 'RAFT' },
  PADDLE: { label: 'Pádla', key: 'PADDLE' },
  LIFE_JACKET: { label: 'Vesty', key: 'LIFE_JACKET' },
  HELMET: { label: 'Helmy', key: 'HELMET' },
  OTHER: { label: 'Ostatní', key: 'OTHER' },
};

export const STATUS_LABELS: Record<
  EquipmentStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  AVAILABLE: {
    label: 'K dispozici',
    color: '#245a43',
    bg: '#edf7f1',
    border: '#c3e6d2',
  },
  RENTED: {
    label: 'Zapůjčeno',
    color: '#26425a',
    bg: '#edf4f9',
    border: '#c5d9e8',
  },
  IN_SERVICE: {
    label: 'V servisu',
    color: '#854d0e',
    bg: '#fef9c3',
    border: '#fde047',
  },
  DISCARDED: {
    label: 'Vyřazeno',
    color: '#57534e',
    bg: '#f5f5f4',
    border: '#d6d3d1',
  },
};

export const CONDITION_LABELS: Record<EquipmentCondition, { label: string; color: string }> = {
  NEW: { label: 'Nové / Zánovní', color: '#245a43' },
  GOOD: { label: 'Dobré', color: '#4a6b6c' },
  WORN: { label: 'Opotřebené', color: '#854d0e' },
  DAMAGED: { label: 'Poškozené', color: '#991b1b' },
};
