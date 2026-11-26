import React from 'react';
import { RentalProtocol } from '../types/phase2';

interface RentalProtocolModalProps {
  protocol: RentalProtocol | null;
  onClose: () => void;
}

export const RentalProtocolModal: React.FC<RentalProtocolModalProps> = ({
  protocol,
  onClose,
}) => {
  if (!protocol) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="modal-overlay protocol-print-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26, 22, 20, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        className="protocol-sheet"
        style={{
          background: '#ffffff',
          border: '3px solid #1a1614',
          boxShadow: '6px 6px 0 #1a1614',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          color: '#1a1614',
        }}
      >
        {/* Horní ovládací lišta (při tisku skrytá) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            paddingBottom: '10px',
            borderBottom: '2px dashed #1a1614',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem' }}>
            NÁHLED PROTOKOLU O VÝPŮJČCE // {protocol.protocol_number}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="tactile-btn tactile-btn-primary" onClick={handlePrint}>
              Tisk / Uložit jako PDF
            </button>
            <button className="tactile-btn" onClick={onClose}>
              Zavřít
            </button>
          </div>
        </div>

        {/* Hlavička tiskového protokolu */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #1a1614',
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '1.25rem' }}>
              SMLOUVA A PROTOKOL O VÝPŮJČCE VYBAVENÍ
            </h2>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              <strong>{protocol.provider_name}</strong>
              <br />
              {protocol.provider_address}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
            <div>
              Číslo protokolu: <strong>{protocol.protocol_number}</strong>
            </div>
            <div>Stav: {protocol.status}</div>
            <div>
              Tarif:{' '}
              <strong>
                {protocol.tariff_type === 'WEEKEND' ? 'VÍKENDOVÝ (2 dny)' : 'STANDARDNÍ'}
              </strong>
            </div>
            <div>Vystaveno: {new Date(protocol.generated_at).toLocaleString('cs-CZ')}</div>
          </div>
        </div>

        {/* Údaje o zákazníkovi a termínu */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '18px',
          }}
        >
          <div style={{ border: '1px solid #1a1614', padding: '10px', fontSize: '0.84rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px' }}>
              NÁJEMCE (ZÁKAZNÍK)
            </div>
            <div>
              <strong>{protocol.customer_name}</strong>
            </div>
            <div>Doklad totožnosti: {protocol.customer_id_card}</div>
            <div>Telefon: {protocol.customer_phone}</div>
            {protocol.customer_email && <div>E-mail: {protocol.customer_email}</div>}
          </div>

          <div style={{ border: '1px solid #1a1614', padding: '10px', fontSize: '0.84rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px' }}>
              TERMÍN VÝPŮJČKY
            </div>
            <div>Od: {new Date(protocol.rental_start).toLocaleString('cs-CZ')}</div>
            <div>Do: {new Date(protocol.rental_end).toLocaleString('cs-CZ')}</div>
            <div>Účtovaných dnů: {protocol.billing_days}</div>
          </div>
        </div>

        {/* Seznam zapůjčených kusů */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '18px',
            fontSize: '0.82rem',
          }}
        >
          <thead>
            <tr style={{ background: '#f4efe6', borderBottom: '2px solid #1a1614' }}>
              <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #1a1614' }}>INV. ČÍSLO</th>
              <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #1a1614' }}>VYBAVENÍ</th>
              <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #1a1614' }}>VELIKOST</th>
              <th style={{ textAlign: 'right', padding: '6px', border: '1px solid #1a1614' }}>SAZBA/DEN</th>
              <th style={{ textAlign: 'right', padding: '6px', border: '1px solid #1a1614' }}>KAUCE</th>
              <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #1a1614' }}>VRÁCENÍ</th>
            </tr>
          </thead>
          <tbody>
            {protocol.items.map((it) => (
              <tr key={it.inventory_number}>
                <td style={{ padding: '6px', border: '1px solid #1a1614', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {it.inventory_number}
                </td>
                <td style={{ padding: '6px', border: '1px solid #1a1614' }}>{it.name}</td>
                <td style={{ padding: '6px', border: '1px solid #1a1614' }}>{it.size}</td>
                <td style={{ padding: '6px', border: '1px solid #1a1614', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  {it.agreed_daily_rate.toFixed(0)} Kč
                </td>
                <td style={{ padding: '6px', border: '1px solid #1a1614', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  {it.agreed_deposit.toFixed(0)} Kč
                </td>
                <td style={{ padding: '6px', border: '1px solid #1a1614', fontSize: '0.76rem' }}>
                  {it.returned_at
                    ? `${new Date(it.returned_at).toLocaleDateString('cs-CZ')}${it.late_penalty > 0 ? ` (+${it.late_penalty} Kč penále)` : ''}`
                    : 'Dosud nevráceno'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Finanční rekapitulace */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.86rem',
          }}
        >
          <div style={{ border: '2px solid #1a1614', padding: '10px 16px', minWidth: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Složená kauce (hotově):</span>
              <strong>{protocol.total_deposit.toFixed(0)} Kč</strong>
            </div>
            {protocol.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sleva obsluhy:</span>
                <span>-{protocol.discount_amount.toFixed(0)} Kč</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Půjčovné celkem:</span>
              <strong>{protocol.total_price.toFixed(0)} Kč</strong>
            </div>
            {protocol.total_penalties > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#991b1b' }}>
                <span>Penále za prodlení:</span>
                <strong>+{protocol.total_penalties.toFixed(0)} Kč</strong>
              </div>
            )}
          </div>
        </div>

        {/* Poznámky a podmínky */}
        <div style={{ fontSize: '0.75rem', color: '#44403c', marginBottom: '28px', lineHeight: 1.45 }}>
          Nájemce potvrzuje převzetí výše uvedeného vybavení ve funkčním stavu a zavazuje se jej vrátit
          nejpozději do sjednaného termínu. Za každý započatý den prodlení se automaticky účtuje smluvní
          penále ve výši sjednané denní sazby každého nevráceného kusu.
          {protocol.notes && (
            <div style={{ marginTop: '6px' }}>
              <strong>Poznámka:</strong> {protocol.notes}
            </div>
          )}
        </div>

        {/* Podpisové řádky */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '36px' }}>
          <div style={{ borderTop: '1px solid #1a1614', paddingTop: '6px', textAlign: 'center', fontSize: '0.78rem' }}>
            Podpis pronajímatele (Hory a voda)
          </div>
          <div style={{ borderTop: '1px solid #1a1614', paddingTop: '6px', textAlign: 'center', fontSize: '0.78rem' }}>
            Podpis nájemce ({protocol.customer_name})
          </div>
        </div>
      </div>
    </div>
  );
};
