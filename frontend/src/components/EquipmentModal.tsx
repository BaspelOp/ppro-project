import React, { useState, useEffect } from 'react';
import {
  EquipmentItem,
  EquipmentItemCreate,
  EquipmentItemUpdate,
  EquipmentCategory,
  EquipmentCondition,
  CATEGORY_LABELS,
  CONDITION_LABELS,
} from '../types/equipment';
import { CloseIcon, AlertIcon } from './Icons';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCreate: (data: EquipmentItemCreate) => Promise<void>;
  onSubmitUpdate: (id: number, data: EquipmentItemUpdate) => Promise<void>;
  initialItem?: EquipmentItem | null;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  initialItem,
}) => {
  const isEditing = !!initialItem;

  const [inventoryNumber, setInventoryNumber] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('SKIS');
  const [size, setSize] = useState('');
  const [purchaseYear, setPurchaseYear] = useState<number>(new Date().getFullYear());
  const [dailyRate, setDailyRate] = useState<number>(350);
  const [deposit, setDeposit] = useState<number>(1500);
  const [condition, setCondition] = useState<EquipmentCondition>('GOOD');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialItem) {
      setInventoryNumber(initialItem.inventory_number);
      setName(initialItem.name);
      setCategory(initialItem.category);
      setSize(initialItem.size);
      setPurchaseYear(initialItem.purchase_year);
      setDailyRate(initialItem.daily_rate);
      setDeposit(initialItem.deposit);
      setCondition(initialItem.condition);
      setNotes(initialItem.notes || '');
    } else {
      setInventoryNumber('');
      setName('');
      setCategory('SKIS');
      setSize('');
      setPurchaseYear(new Date().getFullYear());
      setDailyRate(350);
      setDeposit(1500);
      setCondition('NEW');
      setNotes('');
    }
    setError(null);
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Zadejte název nebo model vybavení.');
      return;
    }
    if (!size.trim()) {
      setError('Zadejte velikost či délku (např. 170 cm, 42 EU).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && initialItem) {
        await onSubmitUpdate(initialItem.id, {
          name: name.trim(),
          category,
          size: size.trim(),
          purchase_year: purchaseYear,
          daily_rate: Number(dailyRate),
          deposit: Number(deposit),
          condition,
          notes: notes.trim() || undefined,
        });
      } else {
        if (!inventoryNumber.trim()) {
          setError('Zadejte unikátní inventární číslo.');
          setIsSubmitting(false);
          return;
        }
        await onSubmitCreate({
          inventory_number: inventoryNumber.trim().toUpperCase(),
          name: name.trim(),
          category,
          size: size.trim(),
          purchase_year: purchaseYear,
          daily_rate: Number(dailyRate),
          deposit: Number(deposit),
          condition,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při ukládání záznamu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="equipment-modal-overlay">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? `Úprava položky: ${initialItem?.inventory_number}` : 'Zaevidovat nový kus vybavení'}
          </h2>
          <button
            id="btn-modal-close"
            className="modal-close-btn"
            onClick={onClose}
            title="Zavřít dialog"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="input-inv-number">
                  Inventární číslo *
                </label>
                <input
                  id="input-inv-number"
                  type="text"
                  className="form-input"
                  placeholder="např. SKI-012"
                  value={inventoryNumber}
                  onChange={(e) => setInventoryNumber(e.target.value)}
                  disabled={isEditing}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="input-category">
                  Kategorie *
                </label>
                <select
                  id="input-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                >
                  {Object.entries(CATEGORY_LABELS).map(([catKey, info]) => (
                    <option key={catKey} value={catKey}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="input-name">
                Název a model kusu *
              </label>
              <input
                id="input-name"
                type="text"
                className="form-input"
                placeholder="např. Atomic Redster G9 Revoshock"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="input-size">
                  Velikost / rozměr *
                </label>
                <input
                  id="input-size"
                  type="text"
                  className="form-input"
                  placeholder="např. 175 cm / 43 EU / 2 osoby"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="input-year">
                  Rok pořízení
                </label>
                <input
                  id="input-year"
                  type="number"
                  className="form-input"
                  min="2000"
                  max="2030"
                  value={purchaseYear}
                  onChange={(e) => setPurchaseYear(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="input-rate">
                  Denní sazba (Kč/den) *
                </label>
                <input
                  id="input-rate"
                  type="number"
                  className="form-input"
                  min="0"
                  step="10"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="input-deposit">
                  Kauce v hotovosti (Kč) *
                </label>
                <input
                  id="input-deposit"
                  type="number"
                  className="form-input"
                  min="0"
                  step="100"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="input-condition">
                Stav opotřebení
              </label>
              <select
                id="input-condition"
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

            <div className="form-group">
              <label className="form-label" htmlFor="input-notes">
                Interní poznámka k vybavení
              </label>
              <textarea
                id="input-notes"
                className="form-textarea"
                placeholder="Poznámky pro personál půjčovny, specifika montáže apod."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              id="btn-cancel-equipment"
              className="tactile-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Zrušit
            </button>
            <button
              type="submit"
              id="btn-save-equipment"
              className="tactile-btn tactile-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ukládám...' : isEditing ? 'Uložit změny' : '+ Zaevidovat kus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
