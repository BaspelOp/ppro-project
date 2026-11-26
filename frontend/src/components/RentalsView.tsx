import React, { useState } from 'react';
import { EquipmentItem, EquipmentCondition } from '../types/equipment';
import {
  Rental,
  Customer,
  RentalCreate,
  ReturnItemPayload,
  RENTAL_STATUS_LABELS,
} from '../types/phase2';

interface RentalsViewProps {
  rentals: Rental[];
  customers: Customer[];
  equipment: EquipmentItem[];
  onCreateRental: (data: RentalCreate) => Promise<void>;
  onActivateReservation: (id: number) => Promise<void>;
  onCancelRental: (id: number) => Promise<void>;
  onReturnItem: (rentalId: number, rentalItemId: number, payload: ReturnItemPayload) => Promise<void>;
  onOpenProtocol: (rentalId: number) => void;
}

export const RentalsView: React.FC<RentalsViewProps> = ({
  rentals,
  customers,
  equipment,
  onCreateRental,
  onActivateReservation,
  onCancelRental,
  onReturnItem,
  onOpenProtocol,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [customerId, setCustomerId] = useState<number>(customers[0]?.id ?? 0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date(Date.now() + 2 * 86400000);
    return d.toISOString().slice(0, 16);
  });
  const [isReservation, setIsReservation] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectableEquipment = equipment.filter(
    (e) => e.status === 'AVAILABLE' || (isReservation && e.status === 'RENTED')
  );

  const toggleItem = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cid = customerId || customers[0]?.id;
    if (!cid) {
      setError('Vyberte zákazníka.');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Vyberte alespoň jeden kus vybavení.');
      return;
    }
    setSubmitting(true);
    try {
      await onCreateRental({
        customer_id: cid,
        equipment_item_ids: selectedIds,
        rental_start: new Date(startDate).toISOString(),
        rental_end: new Date(endDate).toISOString(),
        is_reservation: isReservation,
        discount_amount: Number(discount) || 0,
        notes: notes.trim() || undefined,
      });
      setShowForm(false);
      setSelectedIds([]);
      setNotes('');
      setDiscount(0);
    } catch (err: any) {
      setError(err.message || 'Nepodařilo se vytvořit výpůjčku.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="manifest-area" style={{ padding: '20px', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          borderBottom: '2px solid var(--ink)',
          paddingBottom: '12px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}>
            MANIFEST VÝPŮJČEK A REZERVACÍ (M:N) [{rentals.length}]
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#57534e' }}>
            Blokace překryvů, ochrana servisních kusů, částečné vrácení a automatické penále za prodlení.
          </p>
        </div>
        <button
          className="tactile-btn tactile-btn-primary"
          onClick={() => {
            if (!customerId && customers[0]) setCustomerId(customers[0].id);
            setShowForm((s) => !s);
          }}
        >
          {showForm ? 'Zavřít formulář' : '+ Nová výpůjčka / rezervace'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            border: '2px solid var(--ink)',
            boxShadow: '4px 4px 0 var(--ink)',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ marginTop: 0, fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
            NOVÁ SMLOUVA O VÝPŮJČCE
          </h3>
          {error && (
            <div
              style={{
                background: '#fee2e2',
                border: '2px solid #991b1b',
                color: '#991b1b',
                padding: '8px 12px',
                marginBottom: '12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                ZÁKAZNÍK
              </label>
              <select
                className="form-input"
                value={customerId || customers[0]?.id || ''}
                onChange={(e) => setCustomerId(Number(e.target.value))}
                style={{ width: '100%' }}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id_card_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                OD (ZAČÁTEK)
              </label>
              <input
                type="datetime-local"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                DO (PLÁNOVANÉ VRÁCENÍ)
              </label>
              <input
                type="datetime-local"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                MANUÁLNÍ SLEVA (KČ)
              </label>
              <input
                type="number"
                min={0}
                className="form-input"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
              <input
                type="checkbox"
                checked={isReservation}
                onChange={(e) => setIsReservation(e.target.checked)}
              />
              Rezervace předem (stav RESERVED – nevydává se ihned)
            </label>
            <button
              type="button"
              className="tactile-btn"
              style={{ padding: '4px 10px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
              onClick={() => {
                const now = new Date();
                const day = now.getDay();
                const diffToFri = (5 - day + 7) % 7;
                const fri = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToFri, 14, 0);
                const mon = new Date(fri.getTime() + 67 * 3600 * 1000); // Po 09:00
                const fmt = (d: Date) => {
                  const pad = (n: number) => String(n).padStart(2, '0');
                  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                };
                setStartDate(fmt(fri));
                setEndDate(fmt(mon));
              }}
            >
              Nastavit Víkendový tarif (Pá 14:00 &rarr; Po 09:00 = 2 dny)
            </button>
          </div>

          <div style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
              VYBERTE KUSY VYBAVENÍ (VYBRÁNO: {selectedIds.length})
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '6px',
                maxHeight: '180px',
                overflowY: 'auto',
                border: '2px solid var(--ink)',
                padding: '8px',
                background: 'var(--paper)',
              }}
            >
              {selectableEquipment.map((eq) => {
                const checked = selectedIds.includes(eq.id);
                return (
                  <label
                    key={eq.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px',
                      background: checked ? '#dcfce7' : '#fff',
                      border: '1px solid var(--ink)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleItem(eq.id)}
                    />
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      [{eq.inventory_number}]
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {eq.name} ({eq.daily_rate} Kč/d)
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Poznámka ke smlouvě (volitelné)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="tactile-btn" onClick={() => setShowForm(false)}>
              Zrušit
            </button>
            <button type="submit" className="tactile-btn tactile-btn-primary" disabled={submitting}>
              {submitting ? 'Ukládám...' : isReservation ? 'Vytvořit rezervaci' : 'Vydat vybavení'}
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {rentals.map((rental) => {
          const st = RENTAL_STATUS_LABELS[rental.status];
          const isOverdue =
            (rental.status === 'ACTIVE' || rental.status === 'PARTIALLY_RETURNED') &&
            new Date(rental.rental_end) < new Date();
          const totalPenalty = rental.items.reduce((acc, it) => acc + (it.late_penalty || 0), 0);

          return (
            <div
              key={rental.id}
              style={{
                background: '#fff',
                border: '2px solid var(--ink)',
                boxShadow: '3px 3px 0 var(--ink)',
                padding: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '10px',
                  borderBottom: '1px solid #d6d3d1',
                  paddingBottom: '10px',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      SMLOUVA #{rental.id}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        border: '1px solid var(--ink)',
                        background: st.bg,
                        color: st.color,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >
                      {st.label}
                    </span>
                    {rental.tariff_type === 'WEEKEND' && (
                      <span
                        style={{
                          padding: '2px 8px',
                          border: '1px solid #14532d',
                          background: '#dcfce7',
                          color: '#14532d',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        VÍKENDOVÝ TARIF
                      </span>
                    )}
                    {rental.items.length > 1 && (
                      <span
                        style={{
                          padding: '2px 6px',
                          border: '1px solid #57534e',
                          background: '#f5f5f4',
                          color: '#44403c',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                        }}
                      >
                        Vráceno {rental.items.filter((i) => i.returned_at).length}/{rental.items.length} ks
                      </span>
                    )}
                    {isOverdue && (
                      <span
                        style={{
                          padding: '2px 8px',
                          border: '1px solid #991b1b',
                          background: '#fee2e2',
                          color: '#991b1b',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        PO TERMÍNU VRÁCENÍ!
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                    <strong>{rental.customer?.name ?? `Zákazník #${rental.customer_id}`}</strong>
                    {rental.customer?.phone ? ` • ${rental.customer.phone}` : ''}
                  </div>
                  <div style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: '#57534e', marginTop: '2px' }}>
                    {new Date(rental.rental_start).toLocaleString('cs-CZ')} &rarr;{' '}
                    {new Date(rental.rental_end).toLocaleString('cs-CZ')}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                  <div>
                    Cena: <strong>{rental.total_price.toFixed(0)} Kč</strong>
                    {rental.discount_amount > 0 && ` (sleva ${rental.discount_amount} Kč)`}
                  </div>
                  <div>Kauce: {rental.total_deposit.toFixed(0)} Kč</div>
                  {totalPenalty > 0 && (
                    <div style={{ color: '#991b1b', fontWeight: 700 }}>
                      Penále: +{totalPenalty.toFixed(0)} Kč
                    </div>
                  )}
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button
                      className="tactile-btn"
                      style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                      onClick={() => onOpenProtocol(rental.id)}
                    >
                      Protokol / Tisk
                    </button>
                    {rental.status === 'RESERVED' && (
                      <>
                        <button
                          className="tactile-btn tactile-btn-primary"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => onActivateReservation(rental.id)}
                        >
                          Vydat rezervaci
                        </button>
                        <button
                          className="tactile-btn"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => onCancelRental(rental.id)}
                        >
                          Stornovat
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {rental.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 10px',
                      background: item.returned_at ? '#f5f5f4' : 'var(--paper)',
                      border: '1px solid var(--ink)',
                      fontSize: '0.8rem',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, marginRight: '8px' }}>
                        [{item.equipment_item?.inventory_number ?? `#${item.equipment_item_id}`}]
                      </span>
                      <span>{item.equipment_item?.name ?? 'Vybavení'}</span>
                      <span style={{ marginLeft: '8px', fontFamily: 'var(--font-mono)', color: '#57534e' }}>
                        {item.agreed_daily_rate} Kč/den
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.returned_at ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#15803d' }}>
                          Vráceno {new Date(item.returned_at).toLocaleDateString('cs-CZ')}
                          {item.late_penalty > 0 ? ` (penále ${item.late_penalty} Kč)` : ''}
                        </span>
                      ) : (
                        (rental.status === 'ACTIVE' || rental.status === 'PARTIALLY_RETURNED') && (
                          <>
                            <button
                              className="tactile-btn"
                              style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                              onClick={() =>
                                onReturnItem(rental.id, item.id, {
                                  item_return_condition: 'GOOD' as EquipmentCondition,
                                  send_to_service: false,
                                })
                              }
                            >
                              Vrátit (OK)
                            </button>
                            <button
                              className="tactile-btn"
                              style={{ padding: '3px 8px', fontSize: '0.74rem', borderColor: '#991b1b', color: '#991b1b' }}
                              onClick={() =>
                                onReturnItem(rental.id, item.id, {
                                  item_return_condition: 'DAMAGED' as EquipmentCondition,
                                  send_to_service: true,
                                  notes: 'Poškozeno při vrácení – odesláno do servisu',
                                })
                              }
                            >
                              Vrátit do servisu
                            </button>
                          </>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
