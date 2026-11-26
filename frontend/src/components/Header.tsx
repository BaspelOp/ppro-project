import React from 'react';
import { RefreshIcon, PlusIcon } from './Icons';
import { ActiveTab } from '../types/phase2';

interface HeaderProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenCreateModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const TABS: { id: ActiveTab; label: string }[] = [
  { id: 'equipment', label: '01_VYBAVENÍ' },
  { id: 'rentals', label: '02_VÝPŮJČKY' },
  { id: 'customers', label: '03_ZÁKAZNÍCI' },
  { id: 'categories', label: '04_CENÍK' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onChangeTab,
  onOpenCreateModal,
  onRefresh,
  isLoading,
}) => {
  return (
    <header className="dispatch-header" id="main-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-stamp">DEPOT_01</div>
          <div className="brand-meta">
            <h1>Hory a voda // Dispečink půjčovny</h1>
            <p>PPRO Zadání D • Plný datový model (5 entit + vazba M:N)</p>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }} aria-label="Hlavní navigace">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`tactile-btn ${isActive ? 'tactile-btn-primary' : ''}`}
                onClick={() => onChangeTab(tab.id)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="header-controls">
          <button
            id="btn-refresh-data"
            className="tactile-btn"
            onClick={onRefresh}
            disabled={isLoading}
            title="Aktualizovat data ze serveru"
          >
            <RefreshIcon size={14} />
            <span>{isLoading ? 'Synchronizuji...' : 'Obnovit'}</span>
          </button>

          {activeTab === 'equipment' && (
            <button
              id="btn-add-equipment"
              className="tactile-btn tactile-btn-primary"
              onClick={onOpenCreateModal}
            >
              <PlusIcon size={14} color="#ffffff" />
              <span>+ Nový kus</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
