import React, { useState } from 'react';
import { EquipmentItem } from '../types/equipment';
import { CloseIcon, TrashIcon, AlertIcon } from './Icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number, reason?: string) => Promise<void>;
  item: EquipmentItem | null;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  item,
}) => {
  if (!isOpen || !item) return null;

  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(item.id, reason.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při vyřazování kusu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="confirm-modal-overlay">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrashIcon size={18} color="#8f2323" />
            <h2 className="modal-title" style={{ color: '#8f2323' }}>
              Vyřadit kus z fondu půjčovny
            </h2>
          </div>
          <button id="btn-confirm-modal-close" className="modal-close-btn" onClick={onClose}>
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            Opravdu si přejete vyřadit kus <strong>{item.inventory_number} – {item.name}</strong>?
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Kus bude označen jako vyřazený (DISCARDED). Záznam a celá historie zůstanou v databázi pro
            účetní audit a statistiky opotřebení fondu.
          </p>

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
            <label className="form-label" htmlFor="input-discard-reason">
              Důvod vyřazení (volitelné)
            </label>
            <input
              id="input-discard-reason"
              type="text"
              className="form-input"
              placeholder="např. Zlomené jádro lyže, neopravitelná díra v trupu kanoe..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            id="btn-cancel-discard"
            className="tactile-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Zrušit
          </button>
          <button
            type="button"
            id="btn-confirm-discard"
            className="tactile-btn tactile-btn-danger"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Vyřazuji...' : 'Ano, vyřadit z fondu'}
          </button>
        </div>
      </div>
    </div>
  );
};
