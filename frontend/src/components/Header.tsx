import React from 'react';

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
          <div className="brand-icon">🏔️</div>
          <div>
            <h1 className="brand-title">Hory a voda – Půjčovna</h1>
            <p className="brand-subtitle">
              Informační systém půjčovny vybavení • Rychlé odbavení a správa fondu
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
            <span>🔄</span>
            <span>{isLoading ? 'Načítám...' : 'Obnovit'}</span>
          </button>

          <button
            id="btn-add-equipment"
            className="btn btn-primary"
            onClick={onOpenCreateModal}
          >
            <span>➕</span>
            <span>Zaevidovat nový kus</span>
          </button>
        </div>
      </div>
    </header>
  );
};
