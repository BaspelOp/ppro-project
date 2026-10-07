import React from 'react';
import { EquipmentStats, EquipmentStatus } from '../types/equipment';
import {
  PackageIcon,
  CheckIcon,
  SkiIcon,
  WrenchIcon,
  LayersIcon,
} from './Icons';

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
      icon: <PackageIcon size={18} color="#8c5836" />,
      accent: '#8c5836',
    },
    {
      id: 'stat-card-available',
      status: 'AVAILABLE' as EquipmentStatus,
      title: 'K dispozici',
      value: stats.available,
      sub: 'připraveno k výpůjčce',
      icon: <CheckIcon size={18} color="#22543d" />,
      accent: '#22543d',
    },
    {
      id: 'stat-card-rented',
      status: 'RENTED' as EquipmentStatus,
      title: 'Zapůjčeno',
      value: stats.rented,
      sub: 'u zákazníků na trati / řece',
      icon: <SkiIcon size={18} color="#234563" />,
      accent: '#234563',
    },
    {
      id: 'stat-card-service',
      status: 'IN_SERVICE' as EquipmentStatus,
      title: 'V servisu',
      value: stats.in_service,
      sub: 'broušení, vosk, oprava',
      icon: <WrenchIcon size={18} color="#824d10" />,
      accent: '#824d10',
    },
    {
      id: 'stat-card-discarded',
      status: 'DISCARDED' as EquipmentStatus,
      title: 'Vyřazeno',
      value: stats.discarded,
      sub: 'archivováno v historii',
      icon: <LayersIcon size={18} color="#59534c" />,
      accent: '#59534c',
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
            onClick={() =>
              onSelectStatus(isActive && card.status !== undefined ? undefined : card.status)
            }
            role="button"
            tabIndex={0}
            title={card.status ? `Filtrovat stav: ${card.title}` : 'Zobrazit všechny stavy'}
          >
            <div className="stat-header">
              <span className="stat-title">{card.title}</span>
              <span className="stat-icon-wrap">{card.icon}</span>
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-sub">{card.sub}</div>
          </div>
        );
      })}
    </section>
  );
};
