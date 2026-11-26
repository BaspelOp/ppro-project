import React, { useState } from 'react';
import { Customer, CustomerCreate } from '../types/phase2';

interface CustomersViewProps {
  customers: Customer[];
  onCreateCustomer: (data: CustomerCreate) => Promise<void>;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onCreateCustomer,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idCard, setIdCard] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onCreateCustomer({
        name,
        phone,
        email: email.trim() || undefined,
        id_card_number: idCard,
        notes: notes.trim() || undefined,
      });
      setName('');
      setPhone('');
      setEmail('');
      setIdCard('');
      setNotes('');
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Chyba při ukládání zákazníka.');
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
        <h2 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}>
          EVIDENCE ZÁKAZNÍKŮ [{customers.length}]
        </h2>
        <button
          className="tactile-btn tactile-btn-primary"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? 'Zavřít' : '+ Nový zákazník'}
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
          {error && (
            <div style={{ color: '#991b1b', marginBottom: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <input className="form-input" placeholder="Jméno a příjmení *" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="form-input" placeholder="Telefon *" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <input className="form-input" placeholder="Číslo dokladu (OP/Pas) *" value={idCard} onChange={(e) => setIdCard(e.target.value)} required />
            <input className="form-input" placeholder="E-mail (volitelné)" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <input className="form-input" style={{ flex: 1 }} placeholder="Poznámka..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            <button type="submit" className="tactile-btn tactile-btn-primary">Uložit zákazníka</button>
          </div>
        </form>
      )}

      <div className="table-scroll-wrapper">
        <table className="manifest-table">
          <thead>
            <tr>
              <th>DOKLAD</th>
              <th>JMÉNO</th>
              <th>TELEFON</th>
              <th>E-MAIL</th>
              <th>POZNÁMKA</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{c.id_card_number}</td>
                <td><strong>{c.name}</strong></td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{c.phone}</td>
                <td>{c.email || '—'}</td>
                <td style={{ fontSize: '0.82rem', color: '#57534e' }}>{c.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
