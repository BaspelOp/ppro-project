import React, { useState } from 'react';
import { EquipmentItem } from '../types/equipment';

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
          <h2 className="modal-title" style={{ color: '#fb7185' }}>
            🗑️ Vyřadit kus z fondu půjčovny
          </h2>
          <button id="btn-confirm-modal-close" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
            Opravdu si přejete vyřadit kus <strong>{item.inventory_number} – {item.name}</strong>?
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            Kus bude označen jako vyřazený (DISCARDED). Záznam a historie zůstanou v databázi pro
            účetní audit a statistiky opotřebení.
          </p>

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
              }}
            >
              ⚠️ {error}
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
              placeholder="např. Zlomené jádro lyže, neopravitelná díra v trupu..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            id="btn-cancel-discard"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Zrušit
          </button>
          <button
            type="button"
            id="btn-confirm-discard"
            className="btn btn-danger"
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
