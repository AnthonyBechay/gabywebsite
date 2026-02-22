import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Shield, CheckCircle, AlertTriangle, XCircle, DollarSign } from 'lucide-react';

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

export function Dashboard() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [expiring, setExpiring] = useState<Entry[]>([]);

  useEffect(() => {
    Promise.all([api.getEntries(), api.getExpiringEntries()]).then(
      ([allEntries, expiringEntries]) => {
        setEntries(allEntries);
        setExpiring(expiringEntries);
      }
    );
  }, []);

  const done = entries.filter((e) => e.status === 'DONE').length;
  const doneNotPaid = entries.filter((e) => e.status === 'DONE_NOT_PAID').length;
  const notDone = entries.filter((e) => e.status === 'NOT_DONE').length;
  const totalCost = entries.reduce((sum, e) => sum + e.cost, 0);
  const totalRevenue = entries.reduce((sum, e) => sum + (e.isFree ? 0 : e.sellingPrice), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Jobline Insurance Overview</p>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            <Shield size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Total Entries
          </div>
          <div className="stat-value">{entries.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <CheckCircle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Done
          </div>
          <div className="stat-value" style={{ color: '#04a89a' }}>{done}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <XCircle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Done Not Paid
          </div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{doneNotPaid}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <AlertTriangle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Not Done
          </div>
          <div className="stat-value" style={{ color: '#ef4444' }}>{notDone}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <AlertTriangle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Expiring Soon
          </div>
          <div className="stat-value" style={{ color: '#f59e0b', cursor: 'pointer' }} onClick={() => navigate('/expiring')}>
            {expiring.length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <DollarSign size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Total Cost
          </div>
          <div className="stat-value">${totalCost.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <DollarSign size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Total Revenue
          </div>
          <div className="stat-value" style={{ color: '#04a89a' }}>${totalRevenue.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
