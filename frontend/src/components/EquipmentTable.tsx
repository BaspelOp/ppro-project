import React from 'react';
import {
  EquipmentItem,
  CATEGORY_LABELS,
  STATUS_LABELS,
  CONDITION_LABELS,
} from '../types/equipment';
import {
  CategoryIcon,
  WrenchIcon,
  CheckIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  RefreshIcon,
} from './Icons';

interface EquipmentTableProps {
  items: EquipmentItem[];
  isLoading: boolean;
  onEdit: (item: EquipmentItem) => void;
  onServiceAction: (item: EquipmentItem) => void;
  onDiscard: (item: EquipmentItem) => void;
}

export const EquipmentTable: React.FC<EquipmentTableProps> = ({
  items,
  isLoading,
  onEdit,
  onServiceAction,
  onDiscard,
}) => {
  if (isLoading) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <RefreshIcon size={32} />
          </div>
          <div className="empty-title">Načítám evidenci vybavení...</div>
          <p>Komunikuji s backendovým API serverem</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <SearchIcon size={32} />
          </div>
          <div className="empty-title">Žádné vybavení neodpovídá zadaným filtrům</div>
          <p>Zkuste upravit vyhledávací výraz nebo zvolit jinou kategorii</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card" id="equipment-table-container">
      <div className="table-header-bar">
        <span className="table-count-label">
          Zobrazeno <strong>{items.length}</strong> položek vybavení
        </span>
      </div>

      <div className="table-wrapper">
        <table className="custom-table" id="equipment-items-table">
          <thead>
            <tr>
              <th>Inventární kód</th>
              <th>Vybavení a model</th>
              <th>Kategorie</th>
              <th>Velikost</th>
              <th>Sazba a kauce</th>
              <th>Opotřebení</th>
              <th>Provozní stav</th>
              <th style={{ textAlign: 'right' }}>Akce</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const statusInfo = STATUS_LABELS[item.status] || STATUS_LABELS.AVAILABLE;
              const catInfo = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.OTHER;
              const condInfo = CONDITION_LABELS[item.condition] || CONDITION_LABELS.GOOD;

              return (
                <tr key={item.id} id={`row-equipment-${item.id}`}>
                  <td>
                    <span className="inv-code">{item.inventory_number}</span>
                  </td>
                  <td>
                    <div className="item-name">{item.name}</div>
                    {item.service_notes && (
                      <div className="item-notes" style={{ color: '#854d0e', fontWeight: 500 }}>
                        Servis: {item.service_notes}
                      </div>
                    )}
                    {item.notes && !item.service_notes && (
                      <div className="item-notes">{item.notes}</div>
                    )}
                  </td>
                  <td>
                    <span className="category-badge-inline" title={catInfo.label}>
                      <CategoryIcon category={item.category} size={15} color="#5c4d3f" />
                      <span>{catInfo.label}</span>
                    </span>
                  </td>
                  <td>
                    <strong>{item.size}</strong>
                  </td>
                  <td>
                    <span className="rate-cell">{item.daily_rate} Kč/den</span>
                    <div className="deposit-cell">Kauce {item.deposit} Kč</div>
                  </td>
                  <td>
                    <span
                      className="condition-badge"
                      style={{ color: condInfo.color }}
                    >
                      {condInfo.label}
                    </span>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        color: statusInfo.color,
                        backgroundColor: statusInfo.bg,
                        border: `1px solid ${statusInfo.border}`,
                      }}
                    >
                      <span
                        className="status-dot"
                        style={{ backgroundColor: statusInfo.color }}
                      />
                      {statusInfo.label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      {item.status === 'AVAILABLE' && (
                        <button
                          id={`btn-service-${item.id}`}
                          className="btn btn-amber btn-sm"
                          onClick={() => onServiceAction(item)}
                          title="Odeslat kus do servisu"
                        >
                          <WrenchIcon size={13} color="#824d10" />
                          <span>Do servisu</span>
                        </button>
                      )}

                      {item.status === 'IN_SERVICE' && (
                        <button
                          id={`btn-return-service-${item.id}`}
                          className="btn btn-emerald btn-sm"
                          onClick={() => onServiceAction(item)}
                          title="Vrátit kus ze servisu zpět do půjčovny"
                        >
                          <CheckIcon size={13} color="#22543d" />
                          <span>Zpět do provozu</span>
                        </button>
                      )}

                      <button
                        id={`btn-edit-${item.id}`}
                        className="btn btn-secondary btn-sm"
                        onClick={() => onEdit(item)}
                        title="Upravit parametry kusu"
                      >
                        <EditIcon size={13} />
                      </button>

                      {item.status !== 'DISCARDED' && item.status !== 'RENTED' && (
                        <button
                          id={`btn-discard-${item.id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => onDiscard(item)}
                          title="Vyřadit kus z fondu"
                        >
                          <TrashIcon size={13} color="#8f2323" />
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
    </div>
  );
};
