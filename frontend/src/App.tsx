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
import {
  ActiveTab,
  Category,
  CategoryUpdate,
  Customer,
  CustomerCreate,
  Rental,
  RentalCreate,
  ReturnItemPayload,
  ActiveOverdueSummary,
  UtilizationReport,
  RentalProtocol,
} from './types/phase2';
import { equipmentApi, categoriesApi, customersApi, rentalsApi, reportsApi } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { EquipmentTable } from './components/EquipmentTable';
import { EquipmentModal } from './components/EquipmentModal';
import { ServiceModal } from './components/ServiceModal';
import { ConfirmModal } from './components/ConfirmModal';
import { RentalsView } from './components/RentalsView';
import { CustomersView } from './components/CustomersView';
import { CategoriesView } from './components/CategoriesView';
import { ReportsView } from './components/ReportsView';
import { RentalProtocolModal } from './components/RentalProtocolModal';
import { CheckIcon, InfoIcon, AlertIcon } from './components/Icons';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('equipment');

  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [allItems, setAllItems] = useState<EquipmentItem[]>([]);
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeOverdue, setActiveOverdue] = useState<ActiveOverdueSummary | null>(null);
  const [utilization, setUtilization] = useState<UtilizationReport | null>(null);
  const [activeProtocol, setActiveProtocol] = useState<RentalProtocol | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtry pro vybavení
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
      const [
        fetchedStats,
        fetchedItems,
        fetchedAll,
        fetchedRentals,
        fetchedCustomers,
        fetchedCategories,
        fetchedActiveOverdue,
        fetchedUtilization,
      ] = await Promise.all([
        equipmentApi.getStats(),
        equipmentApi.list({
          category: selectedCategory,
          status: selectedStatus,
          search: search.trim() || undefined,
        }),
        equipmentApi.list(),
        rentalsApi.list(),
        customersApi.list(),
        categoriesApi.list(),
        reportsApi.getActiveOverdue(),
        reportsApi.getUtilization(),
      ]);
      setStats(fetchedStats);
      setItems(fetchedItems);
      setAllItems(fetchedAll);
      setRentals(fetchedRentals);
      setCustomers(fetchedCustomers);
      setCategories(fetchedCategories);
      setActiveOverdue(fetchedActiveOverdue);
      setUtilization(fetchedUtilization);
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

  const handleCreateRental = async (data: RentalCreate) => {
    const created = await rentalsApi.create(data);
    addToast(
      'success',
      `Smlouva #${created.id} (${created.status}) byla vytvořena (${created.items.length} ks).`
    );
    await loadData();
  };

  const handleActivateReservation = async (id: number) => {
    try {
      await rentalsApi.activate(id);
      addToast('success', `Rezervace #${id} byla vydána zákazníkovi.`);
      await loadData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleCancelRental = async (id: number) => {
    try {
      await rentalsApi.cancel(id, 'Stornováno obsluhou');
      addToast('info', `Rezervace #${id} byla stornována (historie zachována).`);
      await loadData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleReturnItem = async (
    rentalId: number,
    rentalItemId: number,
    payload: ReturnItemPayload
  ) => {
    try {
      await rentalsApi.returnItem(rentalId, rentalItemId, payload);
      addToast('success', `Položka byla vrácena ze smlouvy #${rentalId}.`);
      await loadData();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleCreateCustomer = async (data: CustomerCreate) => {
    const created = await customersApi.create(data);
    addToast('success', `Zákazník ${created.name} byl zaregistrován.`);
    await loadData();
  };

  const handleUpdateCategory = async (id: number, data: CategoryUpdate) => {
    const updated = await categoriesApi.update(id, data);
    addToast('success', `Tarif kategorie ${updated.name} byl aktualizován.`);
    await loadData();
  };

  const handleOpenProtocol = async (rentalId: number) => {
    try {
      const protocol = await rentalsApi.getProtocol(rentalId);
      setActiveProtocol(protocol);
    } catch (err: any) {
      addToast('error', `Nepodařilo se načíst protokol: ${err.message}`);
    }
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
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenCreateModal={handleOpenCreateModal}
        onRefresh={loadData}
        isLoading={isLoading}
      />

      {activeTab === 'equipment' && (
        <main className="dispatch-desk">
          <Sidebar
            stats={stats}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
          />

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
      )}

      {activeTab === 'rentals' && (
        <main className="dispatch-desk" style={{ gridTemplateColumns: '1fr' }}>
          <RentalsView
            rentals={rentals}
            customers={customers}
            equipment={allItems}
            onCreateRental={handleCreateRental}
            onActivateReservation={handleActivateReservation}
            onCancelRental={handleCancelRental}
            onReturnItem={handleReturnItem}
            onOpenProtocol={handleOpenProtocol}
          />
        </main>
      )}

      {activeTab === 'customers' && (
        <main className="dispatch-desk" style={{ gridTemplateColumns: '1fr' }}>
          <CustomersView
            customers={customers}
            onCreateCustomer={handleCreateCustomer}
          />
        </main>
      )}

      {activeTab === 'categories' && (
        <main className="dispatch-desk" style={{ gridTemplateColumns: '1fr' }}>
          <CategoriesView
            categories={categories}
            onUpdateCategory={handleUpdateCategory}
          />
        </main>
      )}

      {activeTab === 'reports' && (
        <main className="dispatch-desk" style={{ gridTemplateColumns: '1fr' }}>
          <ReportsView
            activeOverdue={activeOverdue}
            utilization={utilization}
            onOpenProtocol={handleOpenProtocol}
          />
        </main>
      )}

      <RentalProtocolModal
        protocol={activeProtocol}
        onClose={() => setActiveProtocol(null)}
      />

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
