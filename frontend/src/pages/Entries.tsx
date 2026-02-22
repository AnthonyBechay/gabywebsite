import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Plus, Pencil, Trash2, Shield, Download } from 'lucide-react';

interface Entry {
  id: string;
  clientName: string;
  candidateName: string;
  cost: number;
  sellingPrice: number;
  status: string;
  isFree: boolean;
  expiryDate: string;
  notes: string | null;
}

const defaultForm = {
  clientName: '',
  candidateName: '',
  cost: '',
  sellingPrice: '',
  status: 'NOT_DONE',
  isFree: false,
  expiryDate: '',
  notes: '',
};

function statusLabel(status: string) {
  switch (status) {
    case 'DONE': return 'Done';
    case 'DONE_NOT_PAID': return 'Done Not Paid';
    case 'NOT_DONE': return 'Not Done';
    default: return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case 'DONE': return 'badge badge-done';
    case 'DONE_NOT_PAID': return 'badge badge-done-not-paid';
    case 'NOT_DONE': return 'badge badge-not-done';
    default: return 'badge';
  }
}

export function Entries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [deleting, setDeleting] = useState<Entry | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [defaultCost, setDefaultCost] = useState(0);

  const load = () => api.getEntries().then(setEntries);

  const exportCsv = () => {
    const escape = (val: string | number | boolean | null | undefined) => {
      const s = val == null ? '' : String(val);
      return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const headers = ['Client Name', 'Candidate Name', 'Cost', 'Selling Price', 'Status', 'Free', 'Expiry Date', 'Notes', 'Created At'];
    const rows = entries.map((e) => [
      escape(e.clientName),
      escape(e.candidateName),
      escape(e.cost),
      escape(e.isFree ? 'Free' : e.sellingPrice),
      escape(e.status === 'DONE' ? 'Done' : e.status === 'DONE_NOT_PAID' ? 'Done Not Paid' : 'Not Done'),
      escape(e.isFree ? 'Yes' : 'No'),
      escape(new Date(e.expiryDate).toLocaleDateString()),
      escape(e.notes),
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'insurances.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    load();
    api.getSettings().then((s: any) => setDefaultCost(s.defaultCost || 0));
  }, []);

  const openNew = () => {
    setForm({ ...defaultForm, cost: String(defaultCost) });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (e: Entry) => {
    setForm({
      clientName: e.clientName,
      candidateName: e.candidateName,
      cost: String(e.cost),
      sellingPrice: String(e.sellingPrice),
      status: e.status,
      isFree: e.isFree,
      expiryDate: e.expiryDate.split('T')[0],
      notes: e.notes || '',
    });
    setEditing(e);
    setShowForm(true);
  };

  const handleSave = async () => {
    const data = {
      ...form,
      cost: parseFloat(form.cost) || 0,
      sellingPrice: form.isFree ? 0 : parseFloat(form.sellingPrice) || 0,
    };
    if (editing) {
      await api.updateEntry(editing.id, data);
    } else {
      await api.createEntry(data);
    }
    setShowForm(false);
    load();
  };

  const handleDelete = async () => {
    if (deleting) {
      await api.deleteEntry(deleting.id);
      setDeleting(null);
      load();
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Insurance Entries</h1>
          <p className="page-subtitle">{entries.length} total entries</p>
        </div>
        <div className="btn-group">
          <button className="btn btn-secondary" onClick={exportCsv} disabled={entries.length === 0} title="Export all entries as CSV">
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} /> Add Entry
          </button>
        </div>
      </div>

      <div className="card">
        {entries.length === 0 ? (
          <div className="empty-state">
            <Shield size={48} />
            <p>No insurance entries yet. Add your first entry to get started.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Candidate</th>
                  <th>Cost</th>
                  <th>Selling Price</th>
                  <th>Status</th>
                  <th>Free</th>
                  <th>Expiry Date</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500 }}>{e.clientName}</td>
                    <td>{e.candidateName}</td>
                    <td>${e.cost.toLocaleString()}</td>
                    <td>{e.isFree ? <span style={{ color: '#999' }}>Free</span> : `$${e.sellingPrice.toLocaleString()}`}</td>
                    <td><span className={statusClass(e.status)}>{statusLabel(e.status)}</span></td>
                    <td>{e.isFree ? <span className="badge badge-free">Yes</span> : '—'}</td>
                    <td>{new Date(e.expiryDate).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn-icon" onClick={() => openEdit(e)}><Pencil size={15} /></button>
                        <button className="btn-icon danger" onClick={() => setDeleting(e)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <Modal
          title={editing ? 'Edit Entry' : 'New Insurance Entry'}
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Client Name *</label>
            <input className="form-input" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Candidate Name *</label>
            <input className="form-input" value={form.candidateName} onChange={(e) => setForm({ ...form, candidateName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Cost ($)</label>
            <input className="form-input" type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked, sellingPrice: e.target.checked ? '0' : form.sellingPrice })}
                style={{ marginRight: 8 }}
              />
              Free (cost paid but client will not pay)
            </label>
          </div>
          {!form.isFree && (
            <div className="form-group">
              <label className="form-label">Selling Price ($)</label>
              <input className="form-input" type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="NOT_DONE">Not Done</option>
              <option value="DONE">Done</option>
              <option value="DONE_NOT_PAID">Done Not Paid</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Expiry Date *</label>
            <input className="form-input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete Entry"
          message={`Are you sure you want to delete the insurance entry for "${deleting.candidateName}" (client: ${deleting.clientName})?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
