import React from 'react';
import {
  EquipmentItem,
  EquipmentCategory,
  EquipmentStatus,
  CATEGORY_LABELS,
  CONDITION_LABELS,
} from '../types/equipment';
import {
  CategoryIcon,
  WrenchIcon,
  CheckIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  CloseIcon,
  RefreshIcon,
} from './Icons';

interface EquipmentTableProps {
  items: EquipmentItem[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: EquipmentCategory | undefined;
  selectedStatus: EquipmentStatus | undefined;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onEdit: (item: EquipmentItem) => void;
  onServiceAction: (item: EquipmentItem) => void;
  onDiscard: (item: EquipmentItem) => void;
}

export const EquipmentTable: React.FC<EquipmentTableProps> = ({
  items,
  isLoading,
  search,
  onSearchChange,
  selectedCategory,
  selectedStatus,
  onResetFilters,
  hasActiveFilters,
  onEdit,
  onServiceAction,
  onDiscard,
}) => {
  return (
    <div className="manifest-main" id="manifest-main">
      {/* Manifest Top Utility Bar: Search & Status Telemetry */}
      <div className="manifest-topbar" id="manifest-topbar">
        <div className="manifest-search-wrap">
          <span className="manifest-search-icon">
            <SearchIcon size={16} />
          </span>
          <input
            id="manifest-search-input"
            type="text"
            className="manifest-search-input"
            placeholder="Hledat podle kódu (SKI-001), názvu modelu nebo velikosti..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="manifest-telemetry">
          {selectedCategory && (
            <span className="telemetry-tag">
              KAT: <strong>{CATEGORY_LABELS[selectedCategory]?.label}</strong>
            </span>
          )}
          {selectedStatus && (
            <span className="telemetry-tag">
              STAV: <strong>{selectedStatus}</strong>
            </span>
          )}
          <span className="telemetry-tag">
            NALEZENO: <strong>{items.length}</strong>
          </span>

          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              className="tactile-btn tactile-btn-sm"
              onClick={onResetFilters}
              title="Zrušit aktivní filtry"
            >
              <CloseIcon size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Manifest Table Card */}
      <div className="manifest-table-card" id="manifest-table-card">
        <div className="manifest-table-header">
          <span>Manifest inventáře // Hory a voda</span>
          <span>STAV_FONDU // ZOBRAZENO {items.length} POLOŽEK</span>
        </div>

        {isLoading ? (
          <div className="empty-state">
            <RefreshIcon size={32} />
            <div className="empty-title">Synchronizace databáze...</div>
            <p>Dotazuji backend REST API</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <SearchIcon size={32} />
            <div className="empty-title">Žádné položky neodpovídají dotazu</div>
            <p style={{ marginTop: '4px', fontSize: '0.8rem' }}>
              Zkuste změnit hledaný výraz nebo resetovat filtry v levém panelu.
            </p>
          </div>
        ) : (
          <div className="manifest-table-wrap">
            <table className="manifest-table" id="manifest-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Inventární kód</th>
                  <th>Položka a model</th>
                  <th>Kategorie</th>
                  <th>Velikost</th>
                  <th>Denní sazba / Kauce</th>
                  <th>Opotřebení</th>
                  <th>Provozní stav</th>
                  <th style={{ textAlign: 'right' }}>Akce dispečinku</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const catInfo = CATEGORY_LABELS[item.category];
                  const condInfo = CONDITION_LABELS[item.condition];

                  return (
                    <tr key={item.id} id={`row-item-${item.id}`}>
                      <td>
                        <span className="inv-tag">{item.inventory_number}</span>
                      </td>
                      <td>
                        <div className="manifest-item-name">{item.name}</div>
                        {item.service_notes && (
                          <div className="manifest-service-alert">
                            SERVIS: {item.service_notes}
                          </div>
                        )}
                        {item.notes && !item.service_notes && (
                          <div className="manifest-item-meta">{item.notes}</div>
                        )}
                      </td>
                      <td>
                        <span className="category-stamp">
                          <CategoryIcon category={item.category} size={14} color="#1a1614" />
                          <span>{catInfo?.label || item.category}</span>
                        </span>
                      </td>
                      <td>
                        <span className="manifest-size-badge">{item.size}</span>
                      </td>
                      <td>
                        <div className="rate-badge">{item.daily_rate} CZK/den</div>
                        <div className="deposit-sub">Kauce {item.deposit} CZK</div>
                      </td>
                      <td>
                        <span className="condition-stamp">
                          {condInfo?.label || item.condition}
                        </span>
                      </td>
                      <td>
                        <span className={`status-stamp status-stamp-${item.status}`}>
                          {item.status === 'AVAILABLE' && 'K dispozici'}
                          {item.status === 'RENTED' && 'Zapůjčeno'}
                          {item.status === 'IN_SERVICE' && 'V servisu'}
                          {item.status === 'DISCARDED' && 'Vyřazeno'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="manifest-actions-cell">
                          {item.status === 'AVAILABLE' && (
                            <button
                              id={`btn-service-${item.id}`}
                              className="tactile-btn tactile-btn-ochre tactile-btn-sm"
                              onClick={() => onServiceAction(item)}
                              title="Odeslat do servisu"
                            >
                              <WrenchIcon size={12} color="#ffffff" />
                              <span>Servis</span>
                            </button>
                          )}

                          {item.status === 'IN_SERVICE' && (
                            <button
                              id={`btn-return-service-${item.id}`}
                              className="tactile-btn tactile-btn-forest tactile-btn-sm"
                              onClick={() => onServiceAction(item)}
                              title="Vrátit ze servisu do fondu"
                            >
                              <CheckIcon size={12} color="#ffffff" />
                              <span>Vrátit</span>
                            </button>
                          )}

                          <button
                            id={`btn-edit-${item.id}`}
                            className="tactile-btn tactile-btn-sm"
                            onClick={() => onEdit(item)}
                            title="Upravit parametry kusu"
                          >
                            <EditIcon size={12} />
                            <span>Edit</span>
                          </button>

                          {item.status !== 'DISCARDED' && item.status !== 'RENTED' && (
                            <button
                              id={`btn-discard-${item.id}`}
                              className="tactile-btn tactile-btn-danger tactile-btn-sm"
                              onClick={() => onDiscard(item)}
                              title="Vyřadit z fondu"
                            >
                              <TrashIcon size={12} color="#ffffff" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
