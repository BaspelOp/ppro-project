import React from 'react';
import { MountainRiverLogo, RefreshIcon, PlusIcon } from './Icons';

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
    <header className="app-header" id="main-header">
      <div className="header-container">
        <div className="brand-section">
          <div className="brand-logo-badge" title="Půjčovna vybavení Hory a voda">
            <MountainRiverLogo size={28} />
          </div>
          <div>
            <h1 className="brand-title">Hory a voda – Půjčovna</h1>
            <p className="brand-subtitle">
              Informační systém půjčovny outdoorového a zimního vybavení
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            id="btn-refresh-data"
            className="btn btn-secondary"
            onClick={onRefresh}
            disabled={isLoading}
            title="Aktualizovat data ze serveru"
          >
            <RefreshIcon size={15} />
            <span>{isLoading ? 'Načítám...' : 'Obnovit'}</span>
          </button>

          <button
            id="btn-add-equipment"
            className="btn btn-primary"
            onClick={onOpenCreateModal}
          >
            <PlusIcon size={15} color="#ffffff" />
            <span>Zaevidovat nový kus</span>
          </button>
        </div>
      </div>
    </header>
  );
};
