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
import { Sidebar } from './components/Sidebar';
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
    }, 150);
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
    addToast('success', `Kus ${data.inventory_number} byl zaevidován do manifestu.`);
    await loadData();
  };

  const handleUpdateItem = async (id: number, data: EquipmentItemUpdate) => {
    const updated = await equipmentApi.update(id, data);
    addToast('success', `Záznam ${updated.inventory_number} byl aktualizován.`);
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
    <div className="brutalist-app">
      <Header
        onOpenCreateModal={handleOpenCreateModal}
        onRefresh={loadData}
        isLoading={isLoading}
      />

      <main className="dispatch-desk">
        {/* Levý navigační a filtrovací rail */}
        <Sidebar
          stats={stats}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
        />

        {/* Hlavní manifest tabulka s horním panelem */}
        <EquipmentTable
          items={items}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
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

      {/* Toast Notifikace */}
      <div className="toast-container" id="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckIcon size={14} color="#14532d" />}
            {toast.type === 'error' && <AlertIcon size={14} color="#991b1b" />}
            {toast.type === 'info' && <InfoIcon size={14} color="#1a1614" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default App;
