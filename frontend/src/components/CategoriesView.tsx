import React, { useState } from 'react';
import { Category, CategoryUpdate } from '../types/phase2';

interface CategoriesViewProps {
  categories: Category[];
  onUpdateCategory: (id: number, data: CategoryUpdate) => Promise<void>;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onUpdateCategory,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [rate, setRate] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(0);

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setRate(cat.default_daily_rate);
    setDeposit(cat.default_deposit);
  };

  const saveEdit = async (id: number) => {
    await onUpdateCategory(id, {
      default_daily_rate: rate,
      default_deposit: deposit,
    });
    setEditingId(null);
  };

  return (
    <section className="manifest-area" style={{ padding: '20px', width: '100%' }}>
      <div
        style={{
          marginBottom: '16px',
          borderBottom: '2px solid var(--ink)',
          paddingBottom: '12px',
        }}
      >
        <h2 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}>
          KATEGORIE A VÝCHOZÍ CENOVÉ TARIFY [{categories.length}]
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#57534e' }}>
          Změna ceníku neovlivní již uzavřené smlouvy (sazba je fixována v RentalItem dle OB-5).
        </p>
      </div>

      <div className="table-scroll-wrapper">
        <table className="manifest-table">
          <thead>
            <tr>
              <th>KÓD</th>
              <th>NÁZEV</th>
              <th>DENNÍ SAZBA (KČ)</th>
              <th>VÝCHOZÍ KAUCE (KČ)</th>
              <th>POPIS</th>
              <th>AKCE</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;
              return (
                <tr key={cat.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{cat.code}</td>
                  <td><strong>{cat.name}</strong></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: '100px' }}
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                      />
                    ) : (
                      `${cat.default_daily_rate} Kč`
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: '100px' }}
                        value={deposit}
                        onChange={(e) => setDeposit(Number(e.target.value))}
                      />
                    ) : (
                      `${cat.default_deposit} Kč`
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#57534e' }}>{cat.description || '—'}</td>
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="tactile-btn tactile-btn-primary" style={{ padding: '4px 8px', fontSize: '0.74rem' }} onClick={() => saveEdit(cat.id)}>
                          Uložit
                        </button>
                        <button className="tactile-btn" style={{ padding: '4px 8px', fontSize: '0.74rem' }} onClick={() => setEditingId(null)}>
                          Zrušit
                        </button>
                      </div>
                    ) : (
                      <button className="tactile-btn" style={{ padding: '4px 8px', fontSize: '0.74rem' }} onClick={() => startEdit(cat)}>
                        Upravit tarif
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
