import React, { useState, useEffect } from 'react';
import {
  EquipmentItem,
  EquipmentCondition,
  ServiceActionPayload,
  CONDITION_LABELS,
} from '../types/equipment';
import { CloseIcon, WrenchIcon, CheckIcon, AlertIcon } from './Icons';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, payload: ServiceActionPayload) => Promise<void>;
  item: EquipmentItem | null;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
}) => {
  if (!isOpen || !item) return null;

  const isGoingToService = item.status !== 'IN_SERVICE';

  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState<EquipmentCondition>(
    isGoingToService ? 'DAMAGED' : 'GOOD'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNotes('');
    setCondition(isGoingToService ? 'DAMAGED' : 'GOOD');
    setError(null);
  }, [item, isOpen, isGoingToService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setIsSubmitting(true);
    try {
      await onSubmit(item.id, {
        action: isGoingToService ? 'SEND_TO_SERVICE' : 'RETURN_FROM_SERVICE',
        service_notes: notes.trim() || undefined,
        new_condition: condition,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při provádění servisní akce.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="service-modal-overlay">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isGoingToService ? (
              <WrenchIcon size={18} color="#824d10" />
            ) : (
              <CheckIcon size={18} color="#22543d" />
            )}
            <h2 className="modal-title">
              {isGoingToService ? 'Odeslat do servisu' : 'Vrátit ze servisu do půjčovny'}
            </h2>
          </div>
          <button id="btn-service-modal-close" className="modal-close-btn" onClick={onClose}>
            <CloseIcon size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                background: 'var(--bg-primary)',
                padding: '12px 14px',
                borderRadius: '6px',
                border: '1px solid var(--border-medium)',
              }}
            >
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Vybraná položka:</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '2px', color: 'var(--text-primary)' }}>
                <span className="inv-code" style={{ marginRight: '8px' }}>
                  {item.inventory_number}
                </span>
                {item.name} ({item.size})
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: '#fdf0f0',
                  border: '1px solid #f8c9c9',
                  borderLeft: '4px solid #8f2323',
                  color: '#8f2323',
                  padding: '9px 13px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertIcon size={16} color="#8f2323" />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="input-service-notes">
                {isGoingToService
                  ? 'Důvod servisu a popis závady'
                  : 'Provedený servisní zásah'}
              </label>
              <textarea
                id="input-service-notes"
                className="form-textarea"
                placeholder={
                  isGoingToService
                    ? 'např. Broušení hran, voskování skluznice, seřízení bezpečnostního vázání...'
                    : 'např. Hrany nabroušeny, voskováno, přetlakové ventily otestovány...'
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="input-service-condition">
                {isGoingToService
                  ? 'Stav opotřebení před servisem'
                  : 'Nový stav opotřebení po servisu'}
              </label>
              <select
                id="input-service-condition"
                className="form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value as EquipmentCondition)}
              >
                {Object.entries(CONDITION_LABELS).map(([condKey, info]) => (
                  <option key={condKey} value={condKey}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              id="btn-cancel-service"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Zrušit
            </button>
            <button
              type="submit"
              id="btn-confirm-service"
              className={`btn ${isGoingToService ? 'btn-amber' : 'btn-emerald'}`}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Zpracovávám...'
                : isGoingToService
                ? 'Potvrdit odstávku do servisu'
                : 'Vrátit do provozu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
