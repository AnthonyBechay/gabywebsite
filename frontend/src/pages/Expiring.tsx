import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { AlertTriangle } from 'lucide-react';

interface Entry {
  id: string;
  clientName: string;
  candidateName: string;
  cost: number;
  sellingPrice: number;
  status: string;
  isFree: boolean;
  expiryDate: string;
}

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

function getUrgencyClass(expiryDate: string) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'urgency-expired';
  if (diffDays <= 7) return 'urgency-critical';
  return 'urgency-warning';
}

function getUrgencyLabel(expiryDate: string) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `Expired ${Math.abs(diffDays)} days ago`;
  if (diffDays === 0) return 'Expires today';
  if (diffDays === 1) return 'Expires tomorrow';
  return `Expires in ${diffDays} days`;
}

export function Expiring() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    api.getExpiringEntries().then(setEntries);
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Expiring Policies</h1>
          <p className="page-subtitle">{entries.length} policies expiring within 30 days</p>
        </div>
      </div>

      <div className="card">
        {entries.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={48} />
            <p>No policies expiring within the next 30 days.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Urgency</th>
                  <th>Client</th>
                  <th>Candidate</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Selling Price</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <span className={`badge ${getUrgencyClass(e.expiryDate)}`}>
                        {getUrgencyLabel(e.expiryDate)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{e.clientName}</td>
                    <td>{e.candidateName}</td>
                    <td><span className={statusClass(e.status)}>{statusLabel(e.status)}</span></td>
                    <td>${e.cost.toLocaleString()}</td>
                    <td>{e.isFree ? <span style={{ color: '#999' }}>Free</span> : `$${e.sellingPrice.toLocaleString()}`}</td>
                    <td>{new Date(e.expiryDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
