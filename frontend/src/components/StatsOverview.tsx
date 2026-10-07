import React from 'react';
import { EquipmentStats, EquipmentStatus } from '../types/equipment';

interface StatsOverviewProps {
  stats: EquipmentStats | null;
  selectedStatus: EquipmentStatus | undefined;
  onSelectStatus: (status: EquipmentStatus | undefined) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  selectedStatus,
  onSelectStatus,
}) => {
  if (!stats) return null;

  const cards = [
    {
      id: 'stat-card-total',
      status: undefined,
      title: 'Celkem kusů',
      value: stats.total,
      sub: 'všech položek fondu',
      icon: '📦',
      accent: '#38bdf8',
    },
    {
      id: 'stat-card-available',
      status: 'AVAILABLE' as EquipmentStatus,
      title: 'K dispozici',
      value: stats.available,
      sub: 'připraveno k výpůjčce',
      icon: '✅',
      accent: '#10b981',
    },
    {
      id: 'stat-card-rented',
      status: 'RENTED' as EquipmentStatus,
      title: 'Zapůjčeno',
      value: stats.rented,
      sub: 'u zákazníků na trati/svahu',
      icon: '🎿',
      accent: '#3b82f6',
    },
    {
      id: 'stat-card-service',
      status: 'IN_SERVICE' as EquipmentStatus,
      title: 'V servisu',
      value: stats.in_service,
      sub: 'broušení, vosk, opravy',
      icon: '🔧',
      accent: '#f59e0b',
    },
    {
      id: 'stat-card-discarded',
      status: 'DISCARDED' as EquipmentStatus,
      title: 'Vyřazeno',
      value: stats.discarded,
      sub: 'archivováno v historii',
      icon: '📁',
      accent: '#64748b',
    },
  ];

  return (
    <section className="stats-grid" id="stats-overview-section">
      {cards.map((card) => {
        const isActive =
          card.status === undefined
            ? selectedStatus === undefined
            : selectedStatus === card.status;

        return (
          <div
            key={card.id}
            id={card.id}
            className={`stat-card ${isActive ? 'active' : ''}`}
            style={{ '--stat-accent': card.accent } as React.CSSProperties}
            onClick={() => onSelectStatus(isActive && card.status !== undefined ? undefined : card.status)}
            role="button"
            tabIndex={0}
            title={card.status ? `Filtrovat stav: ${card.title}` : 'Zobrazit všechny stavy'}
          >
            <div className="stat-header">
              <span className="stat-title">{card.title}</span>
              <span className="stat-icon">{card.icon}</span>
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-sub">{card.sub}</div>
          </div>
        );
      })}
    </section>
  );
};
