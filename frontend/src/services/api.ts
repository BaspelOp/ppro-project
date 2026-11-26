import {
  EquipmentItem,
  EquipmentItemCreate,
  EquipmentItemUpdate,
  EquipmentStats,
  ServiceActionPayload,
  EquipmentCategory,
  EquipmentStatus,
} from '../types/equipment';
import {
  Category,
  CategoryUpdate,
  Customer,
  CustomerCreate,
  Rental,
  RentalCreate,
  RentalStatus,
  ReturnItemPayload,
  ServiceRecord,
  ActiveOverdueSummary,
  UtilizationReport,
  RentalProtocol,
} from '../types/phase2';

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

export const categoriesApi = {
  async list(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse<Category[]>(res);
  },
  async update(id: number, data: CategoryUpdate): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(res);
  },
};

export const customersApi = {
  async list(search?: string): Promise<Customer[]> {
    const url = `${API_BASE}/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`;
    const res = await fetch(url);
    return handleResponse<Customer[]>(res);
  },
  async create(data: CustomerCreate): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Customer>(res);
  },
};

export const rentalsApi = {
  async list(status?: RentalStatus): Promise<Rental[]> {
    const url = `${API_BASE}/rentals${status ? `?status=${status}` : ''}`;
    const res = await fetch(url);
    return handleResponse<Rental[]>(res);
  },
  async create(data: RentalCreate): Promise<Rental> {
    const res = await fetch(`${API_BASE}/rentals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Rental>(res);
  },
  async activate(id: number): Promise<Rental> {
    const res = await fetch(`${API_BASE}/rentals/${id}/activate`, { method: 'POST' });
    return handleResponse<Rental>(res);
  },
  async cancel(id: number, reason?: string): Promise<Rental> {
    const url = `${API_BASE}/rentals/${id}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`;
    const res = await fetch(url, { method: 'POST' });
    return handleResponse<Rental>(res);
  },
  async returnItem(rentalId: number, rentalItemId: number, payload: ReturnItemPayload): Promise<Rental> {
    const res = await fetch(`${API_BASE}/rentals/${rentalId}/items/${rentalItemId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Rental>(res);
  },
  async getProtocol(rentalId: number): Promise<RentalProtocol> {
    const res = await fetch(`${API_BASE}/rentals/${rentalId}/protocol`);
    return handleResponse<RentalProtocol>(res);
  },
};

export const reportsApi = {
  async getActiveOverdue(): Promise<ActiveOverdueSummary> {
    const res = await fetch(`${API_BASE}/reports/active-overdue`);
    return handleResponse<ActiveOverdueSummary>(res);
  },
  async getUtilization(): Promise<UtilizationReport> {
    const res = await fetch(`${API_BASE}/reports/utilization`);
    return handleResponse<UtilizationReport>(res);
  },
};

export const serviceRecordsApi = {
  async listForItem(equipmentItemId: number): Promise<ServiceRecord[]> {
    const res = await fetch(`${API_BASE}/service-records/equipment/${equipmentItemId}`);
    return handleResponse<ServiceRecord[]>(res);
  },
};
