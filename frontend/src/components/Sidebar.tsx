import React from 'react';
import {
  EquipmentCategory,
  EquipmentStatus,
  EquipmentStats,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from '../types/equipment';
import { CategoryIcon, LayersIcon } from './Icons';

interface SidebarProps {
  stats: EquipmentStats | null;
  selectedCategory: EquipmentCategory | undefined;
  onSelectCategory: (category: EquipmentCategory | undefined) => void;
  selectedStatus: EquipmentStatus | undefined;
  onSelectStatus: (status: EquipmentStatus | undefined) => void;
}

const CATEGORIES: EquipmentCategory[] = [
  'SKIS',
  'SNOWBOARD',
  'BOOTS',
  'POLES',
  'BOAT',
  'RAFT',
  'LIFE_JACKET',
  'HELMET',
  'PADDLE',
];

export const Sidebar: React.FC<SidebarProps> = ({
  stats,
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
}) => {
  const statusItems: {
    status: EquipmentStatus | undefined;
    label: string;
    count: number;
    color: string;
  }[] = [
    {
      status: undefined,
      label: 'Všechny stavy fondu',
      count: stats?.total ?? 0,
      color: '#1a1614',
    },
    {
      status: 'AVAILABLE',
      label: 'K dispozici',
      count: stats?.available ?? 0,
      color: '#15803d',
    },
    {
      status: 'RENTED',
      label: 'Zapůjčeno zákazníkům',
      count: stats?.rented ?? 0,
      color: '#0369a1',
    },
    {
      status: 'IN_SERVICE',
      label: 'V servisu / údržbě',
      count: stats?.in_service ?? 0,
      color: '#d97706',
    },
    {
      status: 'DISCARDED',
      label: 'Vyřazeno z fondu',
      count: stats?.discarded ?? 0,
      color: '#78716c',
    },
  ];

  return (
    <aside className="sidebar-rail" id="sidebar-rail">
      {/* Panel 1: Filtry provozního stavu */}
      <div className="rail-panel" id="panel-status-filters">
        <div className="rail-panel-header">
          <span>Stav vybavení</span>
          <span>[FILTR]</span>
        </div>
        <div className="rail-panel-body status-pill-list">
          {statusItems.map((item) => {
            const isActive = selectedStatus === item.status;
            return (
              <button
                key={item.label}
                id={item.status ? `status-btn-${item.status.toLowerCase()}` : 'status-btn-all'}
                className={`status-pill-btn ${isActive ? 'active' : ''}`}
                style={{ '--status-indicator-color': item.color } as React.CSSProperties}
                onClick={() => onSelectStatus(item.status)}
              >
                <span>
                  <span
                    className="status-dot-square"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
                <span className="rail-item-count">{item.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel 2: Kategorie vybavení */}
      <div className="rail-panel" id="panel-category-filters">
        <div className="rail-panel-header">
          <span>Katalog kategorií</span>
          <span>[{CATEGORIES.length}]</span>
        </div>
        <div className="rail-panel-body">
          <button
            id="cat-btn-all"
            className={`rail-item-btn ${selectedCategory === undefined ? 'active' : ''}`}
            onClick={() => onSelectCategory(undefined)}
          >
            <span className="rail-item-label">
              <LayersIcon size={14} />
              <span>Všechny kategorie</span>
            </span>
            <span className="rail-item-count">{stats?.total ?? 0}</span>
          </button>

          {CATEGORIES.map((catKey) => {
            const catInfo = CATEGORY_LABELS[catKey];
            const isSelected = selectedCategory === catKey;
            const count = stats?.by_category?.[catKey] ?? 0;

            return (
              <button
                key={catKey}
                id={`cat-btn-${catKey.toLowerCase()}`}
                className={`rail-item-btn ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectCategory(isSelected ? undefined : catKey)}
              >
                <span className="rail-item-label">
                  <CategoryIcon category={catKey} size={14} />
                  <span>{catInfo.label}</span>
                </span>
                <span className="rail-item-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
