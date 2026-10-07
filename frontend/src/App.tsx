import React, { useState, useEffect, useCallback } from 'react';
import {
  EquipmentItem,
  EquipmentItemCreate,
  EquipmentItemUpdate,
  EquipmentStats,
  EquipmentCategory,
  EquipmentStatus,
  ServiceActionPayload,
} from './types/equipment';
import { equipmentApi } from './services/api';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { EquipmentTable } from './components/EquipmentTable';
import { EquipmentModal } from './components/EquipmentModal';
import { ServiceModal } from './components/ServiceModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CheckIcon, CloseIcon, InfoIcon, AlertIcon } from './components/Icons';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const App: React.FC = () => {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtry
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<EquipmentStatus | undefined>(undefined);

  // Modální okna
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceItem, setServiceItem] = useState<EquipmentItem | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [discardItem, setDiscardItem] = useState<EquipmentItem | null>(null);

  // Notifikace
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedStats, fetchedItems] = await Promise.all([
        equipmentApi.getStats(),
        equipmentApi.list({
          category: selectedCategory,
          status: selectedStatus,
          search: search.trim() || undefined,
        }),
      ]);
      setStats(fetchedStats);
      setItems(fetchedItems);
    } catch (err: any) {
      addToast('error', `Chyba při načítání dat: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setIsEquipmentModalOpen(true);
  };

  const handleOpenEditModal = (item: EquipmentItem) => {
    setEditingItem(item);
    setIsEquipmentModalOpen(true);
  };

  const handleOpenServiceModal = (item: EquipmentItem) => {
    setServiceItem(item);
    setIsServiceModalOpen(true);
  };

  const handleOpenDiscardModal = (item: EquipmentItem) => {
    setDiscardItem(item);
    setIsConfirmModalOpen(true);
  };

  const handleCreateItem = async (data: EquipmentItemCreate) => {
    await equipmentApi.create(data);
    addToast('success', `Kus ${data.inventory_number} byl úspěšně zaevidován do fondu.`);
    await loadData();
  };

  const handleUpdateItem = async (id: number, data: EquipmentItemUpdate) => {
    const updated = await equipmentApi.update(id, data);
    addToast('success', `Položka ${updated.inventory_number} byla upravena.`);
    await loadData();
  };

  const handleServiceAction = async (id: number, payload: ServiceActionPayload) => {
    const updated = await equipmentApi.performServiceAction(id, payload);
    const actionLabel =
      payload.action === 'SEND_TO_SERVICE' ? 'odeslán do servisu' : 'vrácen do provozu';
    addToast('success', `Kus ${updated.inventory_number} byl ${actionLabel}.`);
    await loadData();
  };

  const handleConfirmDiscard = async (id: number, reason?: string) => {
    const discarded = await equipmentApi.discard(id, reason);
    addToast('info', `Kus ${discarded.inventory_number} byl vyřazen z fondu.`);
    await loadData();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory(undefined);
    setSelectedStatus(undefined);
  };

  const hasActiveFilters =
    Boolean(search.trim()) || selectedCategory !== undefined || selectedStatus !== undefined;

  return (
    <div className="app-layout">
      <Header
        onOpenCreateModal={handleOpenCreateModal}
        onRefresh={loadData}
        isLoading={isLoading}
      />

      <main className="main-content">
        {/* Banner klientské konzultace */}
        <div className="client-note-banner" id="client-demo-banner">
          <div className="client-note-content">
            <span className="client-note-badge">Prototyp k ověření</span>
            <span className="client-note-text">
              <strong>Zadání D: Půjčovna vybavení „Hory a voda“</strong> – Evidence položek, ranní přehledový dashboard a servisní odstávky pro konzultaci s klientem.
            </span>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => addToast('info', 'Zpětná vazba klienta k designu byla zapracována (teplá béžovo-hnědá paleta, flat styl, vektorové SVG ikony).')}
          >
            <InfoIcon size={14} />
            <span>Záznam rozhodnutí</span>
          </button>
        </div>

        {/* Dashboard statistik */}
        <StatsOverview
          stats={stats}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
        />

        {/* Vyhledávání a filtry */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Tabulka a seznam vybavení */}
        <EquipmentTable
          items={items}
          isLoading={isLoading}
          onEdit={handleOpenEditModal}
          onServiceAction={handleOpenServiceModal}
          onDiscard={handleOpenDiscardModal}
        />
      </main>

      {/* Modální okna */}
      <EquipmentModal
        isOpen={isEquipmentModalOpen}
        onClose={() => setIsEquipmentModalOpen(false)}
        onSubmitCreate={handleCreateItem}
        onSubmitUpdate={handleUpdateItem}
        initialItem={editingItem}
      />

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSubmit={handleServiceAction}
        item={serviceItem}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDiscard}
        item={discardItem}
      />

      {/* Notifikace Toasty (Flat warm design bez emoji) */}
      <div className="toast-container" id="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckIcon size={16} color="#22543d" />}
            {toast.type === 'error' && <AlertIcon size={16} color="#8f2323" />}
            {toast.type === 'info' && <InfoIcon size={16} color="#8c5836" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default App;
