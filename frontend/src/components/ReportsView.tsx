import React from 'react';
import { ActiveOverdueSummary, UtilizationReport } from '../types/phase2';
import { CATEGORY_LABELS, EquipmentCategory } from '../types/equipment';

interface ReportsViewProps {
  activeOverdue: ActiveOverdueSummary | null;
  utilization: UtilizationReport | null;
  onOpenProtocol: (rentalId: number) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  activeOverdue,
  utilization,
  onOpenProtocol,
}) => {
  return (
    <section className="manifest-area" style={{ padding: '20px', width: '100%' }}>
      <div
        style={{
          marginBottom: '18px',
          borderBottom: '2px solid var(--ink)',
          paddingBottom: '12px',
        }}
      >
        <h2 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}>
          REPORTING &amp; ANALYTIKA PROVOZU (FÁZE 3)
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#57534e' }}>
          Přehled aktuálně zapůjčených kusů, prodlení s vrácením a statistika vytíženosti pro plánování nákupů.
        </p>
      </div>

      {/* KPI Karty */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div style={{ background: '#fff', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', padding: '14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#57534e' }}>AKTIVNÍ SMLOUVY</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800 }}>
            {activeOverdue?.active_rentals_count ?? 0}
          </div>
        </div>
        <div style={{ background: '#fff', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', padding: '14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#57534e' }}>ZAPŮJČENÝCH KUSŮ VENKU</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#0369a1' }}>
            {activeOverdue?.active_items_count ?? 0}
          </div>
        </div>
        <div
          style={{
            background: (activeOverdue?.overdue_items_count ?? 0) > 0 ? '#fee2e2' : '#fff',
            border: '2px solid var(--ink)',
            boxShadow: '3px 3px 0 var(--ink)',
            padding: '14px',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#991b1b' }}>KUSY PO TERMÍNU VRÁCENÍ</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#991b1b' }}>
            {activeOverdue?.overdue_items_count ?? 0}
          </div>
        </div>
        <div style={{ background: '#fff', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', padding: '14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#57534e' }}>ODHAD PENÁLE K DNEŠKU</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#b45309' }}>
            {(activeOverdue?.total_estimated_penalty ?? 0).toFixed(0)} Kč
          </div>
        </div>
      </div>

      {/* Sekce 1: Aktuálně zapůjčené kusy a prodlení */}
      <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', marginBottom: '10px' }}>
        1. AKTUÁLNĚ ZAPŮJČENÉ KUSY A PRODLENÍ [{activeOverdue?.items.length ?? 0}]
      </h3>
      <div className="table-scroll-wrapper" style={{ marginBottom: '28px' }}>
        <table className="manifest-table">
          <thead>
            <tr>
              <th>STAV</th>
              <th>INV. ČÍSLO</th>
              <th>VYBAVENÍ</th>
              <th>ZÁKAZNÍK &amp; TELEFON</th>
              <th>TERMÍN VRÁCENÍ</th>
              <th>ODHAD PENÁLE</th>
              <th>PROTOKOL</th>
            </tr>
          </thead>
          <tbody>
            {!activeOverdue || activeOverdue.items.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '16px', color: '#57534e' }}>
                  Žádné kusy nejsou aktuálně venku.
                </td>
              </tr>
            ) : (
              activeOverdue.items.map((item) => (
                <tr key={item.rental_item_id} style={{ background: item.is_overdue ? '#fef2f2' : undefined }}>
                  <td>
                    {item.is_overdue ? (
                      <span
                        style={{
                          padding: '2px 6px',
                          background: '#fee2e2',
                          border: '1px solid #991b1b',
                          color: '#991b1b',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        +{item.overdue_days}d PRODLENÍ
                      </span>
                    ) : (
                      <span
                        style={{
                          padding: '2px 6px',
                          background: '#e0f2fe',
                          border: '1px solid #0369a1',
                          color: '#0369a1',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        V TERMÍNU
                      </span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{item.inventory_number}</td>
                  <td>{item.equipment_name}</td>
                  <td>
                    <strong>{item.customer_name}</strong>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#57534e' }}>
                      {item.customer_phone}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {new Date(item.rental_end).toLocaleString('cs-CZ')}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: item.is_overdue ? '#991b1b' : '#57534e' }}>
                    {item.estimated_penalty > 0 ? `+${item.estimated_penalty.toFixed(0)} Kč` : '0 Kč'}
                  </td>
                  <td>
                    <button
                      className="tactile-btn"
                      style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                      onClick={() => onOpenProtocol(item.rental_id)}
                    >
                      Protokol #{item.rental_id}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sekce 2: Statistika vytíženosti kategorií (podklad pro dokupování) */}
      <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', marginBottom: '10px' }}>
        2. VYTÍŽENOST KATEGORIÍ (PODKLAD PRO DOKUPOVÁNÍ)
      </h3>
      <div className="table-scroll-wrapper" style={{ marginBottom: '28px' }}>
        <table className="manifest-table">
          <thead>
            <tr>
              <th>KATEGORIE</th>
              <th>AKTIVNÍ FOND</th>
              <th>VOLNÉ</th>
              <th>ZAPŮJČENO</th>
              <th>V SERVISU</th>
              <th>OBSAZENOST</th>
              <th>CELKEM VÝPŮJČEK</th>
              <th>TRŽBY (KČ)</th>
            </tr>
          </thead>
          <tbody>
            {(utilization?.by_category ?? []).map((cat) => {
              const label =
                CATEGORY_LABELS[cat.category as EquipmentCategory]?.label ?? cat.category;
              return (
                <tr key={cat.category}>
                  <td><strong>{label}</strong></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{cat.total_items} ks</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#15803d' }}>{cat.available_items}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#0369a1', fontWeight: 700 }}>{cat.rented_items}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#b45309' }}>{cat.in_service_items}</td>
                  <td style={{ minWidth: '140px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '10px', border: '1px solid var(--ink)', background: '#f4efe6' }}>
                        <div
                          style={{
                            width: `${Math.min(100, cat.occupancy_pct)}%`,
                            height: '100%',
                            background: cat.occupancy_pct >= 70 ? '#b91c1c' : '#245a43',
                          }}
                        />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', fontWeight: 700 }}>
                        {cat.occupancy_pct}%
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{cat.total_rentals}×</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {cat.total_revenue.toFixed(0)} Kč
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sekce 3: Vytíženost konkrétních kusů */}
      <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', marginBottom: '10px' }}>
        3. TOP VYTÍŽENOST JEDNOTLIVÝCH KUSŮ
      </h3>
      <div className="table-scroll-wrapper">
        <table className="manifest-table">
          <thead>
            <tr>
              <th>INV. ČÍSLO</th>
              <th>NÁZEV</th>
              <th>VÝPŮJČEK</th>
              <th>DNŮ VENKU</th>
              <th>TRŽBY</th>
              <th>SERVISŮ</th>
              <th>NÁKLADY SERVISU</th>
            </tr>
          </thead>
          <tbody>
            {(utilization?.by_equipment ?? []).slice(0, 12).map((eq) => (
              <tr key={eq.equipment_item_id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{eq.inventory_number}</td>
                <td>{eq.name}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{eq.rental_count}×</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{eq.total_rented_days} d</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{eq.total_revenue.toFixed(0)} Kč</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{eq.service_count}×</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: eq.total_service_cost > 0 ? '#991b1b' : '#57534e' }}>
                  {eq.total_service_cost.toFixed(0)} Kč
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
