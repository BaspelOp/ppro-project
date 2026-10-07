import React from 'react';
import {
  EquipmentCategory,
  EquipmentStatus,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from '../types/equipment';
import { SearchIcon, CloseIcon, CategoryIcon, LayersIcon } from './Icons';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: EquipmentCategory | undefined;
  onSelectCategory: (category: EquipmentCategory | undefined) => void;
  selectedStatus: EquipmentStatus | undefined;
  onSelectStatus: (status: EquipmentStatus | undefined) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
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

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="filter-container" id="filter-bar">
      <div className="filter-row-top">
        <div className="search-box">
          <span className="search-icon">
            <SearchIcon size={16} />
          </span>
          <input
            id="filter-search-input"
            type="text"
            className="search-input"
            placeholder="Hledat podle modelu, inventárního čísla nebo velikosti..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="status-select-wrap">
          <select
            id="filter-status-select"
            className="form-select"
            value={selectedStatus || ''}
            onChange={(e) =>
              onSelectStatus(e.target.value ? (e.target.value as EquipmentStatus) : undefined)
            }
          >
            <option value="">Všechny stavy položek</option>
            {Object.entries(STATUS_LABELS).map(([statusKey, info]) => (
              <option key={statusKey} value={statusKey}>
                {info.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            id="btn-reset-filters"
            className="btn btn-secondary btn-sm"
            onClick={onResetFilters}
            title="Zrušit všechny aktivní filtry"
          >
            <CloseIcon size={14} />
            <span>Reset filtrů</span>
          </button>
        )}
      </div>

      <div className="category-chips" id="category-chips-list">
        <button
          id="chip-category-all"
          className={`chip-btn ${selectedCategory === undefined ? 'active' : ''}`}
          onClick={() => onSelectCategory(undefined)}
        >
          <LayersIcon size={15} />
          <span>Všechny kategorie</span>
        </button>

        {CATEGORIES.map((catKey) => {
          const item = CATEGORY_LABELS[catKey];
          const isSelected = selectedCategory === catKey;
          return (
            <button
              key={catKey}
              id={`chip-category-${catKey.toLowerCase()}`}
              className={`chip-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(isSelected ? undefined : catKey)}
            >
              <CategoryIcon category={catKey} size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
