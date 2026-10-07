import React from 'react';
import { RefreshIcon, PlusIcon } from './Icons';

interface HeaderProps {
  onOpenCreateModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
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
            <p>PPRO Zadání D • Evidence fondu outdoorového vybavení</p>
          </div>
        </div>

        <div className="header-controls">
          <button
            id="btn-refresh-data"
            className="tactile-btn"
            onClick={onRefresh}
            disabled={isLoading}
            title="Aktualizovat data ze serveru"
          >
            <RefreshIcon size={14} />
            <span>{isLoading ? 'Synchronizuji...' : 'Obnovit data'}</span>
          </button>

          <button
            id="btn-add-equipment"
            className="tactile-btn tactile-btn-primary"
            onClick={onOpenCreateModal}
          >
            <PlusIcon size={14} color="#ffffff" />
            <span>+ Zaevidovat nový kus</span>
          </button>
        </div>
      </div>
    </header>
  );
};
