import {
  EquipmentItem,
  EquipmentItemCreate,
  EquipmentItemUpdate,
  EquipmentStats,
  ServiceActionPayload,
  EquipmentCategory,
  EquipmentStatus,
} from '../types/equipment';

const API_BASE = '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = `Chyba serveru (${res.status})`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) {
        errorMessage = Array.isArray(errorJson.detail)
          ? errorJson.detail.map((d: any) => d.msg).join(', ')
          : errorJson.detail;
      }
    } catch {
      // Pokud odpověď není JSON
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export const equipmentApi = {
  async getStats(): Promise<EquipmentStats> {
    const res = await fetch(`${API_BASE}/equipment/stats`);
    return handleResponse<EquipmentStats>(res);
  },

  async list(filters?: {
    category?: EquipmentCategory;
    status?: EquipmentStatus;
    search?: string;
  }): Promise<EquipmentItem[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const url = `${API_BASE}/equipment${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse<EquipmentItem[]>(res);
  },

  async getById(id: number): Promise<EquipmentItem> {
    const res = await fetch(`${API_BASE}/equipment/${id}`);
    return handleResponse<EquipmentItem>(res);
  },

  async create(data: EquipmentItemCreate): Promise<EquipmentItem> {
    const res = await fetch(`${API_BASE}/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<EquipmentItem>(res);
  },

  async update(id: number, data: EquipmentItemUpdate): Promise<EquipmentItem> {
    const res = await fetch(`${API_BASE}/equipment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<EquipmentItem>(res);
  },

  async performServiceAction(id: number, payload: ServiceActionPayload): Promise<EquipmentItem> {
    const res = await fetch(`${API_BASE}/equipment/${id}/service`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<EquipmentItem>(res);
  },

  async discard(id: number, reason?: string): Promise<EquipmentItem> {
    const url = `${API_BASE}/equipment/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`;
    const res = await fetch(url, {
      method: 'DELETE',
    });
    return handleResponse<EquipmentItem>(res);
  },
};
