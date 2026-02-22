import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export function Settings() {
  const [defaultCost, setDefaultCost] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getSettings().then((s: any) => {
      setDefaultCost(String(s.defaultCost || 0));
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      await api.updateSettings({ defaultCost: parseFloat(defaultCost) || 0 });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure default values</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">
              <SettingsIcon size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Default Insurance Cost ($)
            </label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              value={defaultCost}
              onChange={(e) => setDefaultCost(e.target.value)}
              placeholder="Enter default cost"
              style={{ maxWidth: 300 }}
            />
            <p style={{ fontSize: 13, color: '#999', marginTop: 6 }}>
              This cost will be auto-filled when creating new insurance entries.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
            {saved && <span style={{ color: '#04a89a', fontSize: 14 }}>Settings saved successfully!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
