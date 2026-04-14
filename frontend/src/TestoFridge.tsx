import { useEffect, useState } from 'react';

interface TestoReading {
  id?: number;
  source: string;
  device_id: string;
  device_name: string;
  location: string | null;
  temperature: number;
  humidity: number | null;
  status: string;
  recorded_at: string;
  imported_at?: string;
}

export default function TestoFridge() {
  const [readings, setReadings] = useState<TestoReading[]>([]);
  const [alertsOnly, setAlertsOnly] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [location, setLocation] = useState('');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');

  async function loadReadings(showAlerts = alertsOnly) {
    try {
      const endpoint = showAlerts ? '/api/testo/alerts' : '/api/testo/readings';
      const res = await fetch(endpoint);
      const data = await res.json();

      if (Array.isArray(data)) {
        setReadings(data);
      } else {
        setReadings([]);
        setMessage('Failed to load Testo readings');
      }
    } catch {
      setReadings([]);
      setMessage('Failed to load Testo readings');
    }
  }

  async function runImport() {
    setLoading(true);
    setMessage('Running Testo cloud import...');

    try {
      const res = await fetch('/api/testo/ingest', {
        method: 'POST'
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`Import finished. Inserted: ${data.result.inserted}, skipped: ${data.result.skipped}`);
        await loadReadings(false);
        setAlertsOnly(false);
      } else {
        setMessage('Import failed');
      }
    } catch {
      setMessage('Import failed');
    } finally {
      setLoading(false);
    }
  }

  async function submitManualEntry(e: React.FormEvent) {
    e.preventDefault();
    setMessage('Saving manual entry...');

    try {
      const res = await fetch('/api/testo/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_id: deviceId,
          device_name: deviceName,
          location,
          temperature: parseFloat(temperature),
          humidity: humidity ? parseFloat(humidity) : null
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage('Manual entry saved');
        setDeviceId('');
        setDeviceName('');
        setLocation('');
        setTemperature('');
        setHumidity('');
        await loadReadings(false);
        setAlertsOnly(false);
      } else {
        setMessage(data.message || 'Manual entry failed');
      }
    } catch {
      setMessage('Manual entry failed');
    }
  }

  useEffect(() => {
    loadReadings(false);
  }, []);

  return (
    <div style={{ background: '#f4f7fb', minHeight: '100vh', fontFamily: 'Arial, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', fontSize: '42px', marginBottom: '24px', color: '#12344d' }}>
          Testo Fridge Monitoring
        </h1>

        {message && (
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}
          >
            <h2 style={{ marginTop: 0 }}>Manual Entry</h2>

            <form onSubmit={submitManualEntry}>
              <label style={labelStyle}>
                Device ID
                <input style={inputStyle} value={deviceId} onChange={(e) => setDeviceId(e.target.value)} required />
              </label>

              <label style={labelStyle}>
                Device Name
                <input style={inputStyle} value={deviceName} onChange={(e) => setDeviceName(e.target.value)} required />
              </label>

              <label style={labelStyle}>
                Location
                <input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} />
              </label>

              <label style={labelStyle}>
                Temperature (°C)
                <input
                  style={inputStyle}
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  required
                />
              </label>

              <label style={labelStyle}>
                Humidity (%)
                <input
                  style={inputStyle}
                  type="number"
                  step="0.1"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                />
              </label>

              <button type="submit" style={primaryButtonStyle}>
                Save Manual Entry
              </button>
            </form>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}
          >
            <h2 style={{ marginTop: 0 }}>Automatic Cloud Import</h2>
            <p style={{ color: '#475569', lineHeight: 1.5 }}>
              This simulates Testo cloud ingestion using sample data until the real client cloud access is available.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
              <button onClick={runImport} disabled={loading} style={primaryButtonStyle} type="button">
                {loading ? 'Importing...' : 'Run Testo Cloud Import'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAlertsOnly(false);
                  loadReadings(false);
                }}
                style={secondaryButtonStyle}
              >
                Show All
              </button>

              <button
                type="button"
                onClick={() => {
                  setAlertsOnly(true);
                  loadReadings(true);
                }}
                style={secondaryButtonStyle}
              >
                Show Alerts
              </button>
            </div>

            <div
              style={{
                marginTop: '18px',
                background: '#eff6ff',
                borderRadius: '12px',
                padding: '14px'
              }}
            >
              <strong>Status Rule</strong>
              <div style={{ marginTop: '8px' }}>SAFE = 5°C or below</div>
              <div>ALERT = above 5°C</div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}
        >
          <h2 style={{ marginTop: 0 }}>{alertsOnly ? 'Testo Alert Readings' : 'All Testo Fridge Readings'}</h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Source</th>
                  <th style={thStyle}>Device ID</th>
                  <th style={thStyle}>Device Name</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Temperature (°C)</th>
                  <th style={thStyle}>Humidity (%)</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Recorded At</th>
                  <th style={thStyle}>Imported At</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((reading, index) => (
                  <tr
                    key={`${reading.device_id}-${reading.recorded_at}-${index}`}
                    style={reading.status === 'ALERT' ? { background: '#fff1f2' } : {}}
                  >
                    <td style={tdStyle}>{reading.source}</td>
                    <td style={tdStyle}>{reading.device_id}</td>
                    <td style={tdStyle}>{reading.device_name}</td>
                    <td style={tdStyle}>{reading.location || '-'}</td>
                    <td style={tdStyle}>{reading.temperature}</td>
                    <td style={tdStyle}>{reading.humidity ?? '-'}</td>
                    <td style={tdStyle}>{reading.status}</td>
                    <td style={tdStyle}>{reading.recorded_at}</td>
                    <td style={tdStyle}>{reading.imported_at || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {readings.length === 0 && <p style={{ marginTop: '16px', color: '#64748b' }}>No readings to display.</p>}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '14px',
  color: '#0f172a',
  fontWeight: 600
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '6px',
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  boxSizing: 'border-box',
  fontSize: '14px'
};

const primaryButtonStyle: React.CSSProperties = {
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 700
};

const secondaryButtonStyle: React.CSSProperties = {
  background: '#e2e8f0',
  color: '#0f172a',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 700
};

const thStyle: React.CSSProperties = {
  borderBottom: '1px solid #cbd5e1',
  textAlign: 'left',
  padding: '12px',
  background: '#f8fafc',
  whiteSpace: 'nowrap'
};

const tdStyle: React.CSSProperties = {
  borderBottom: '1px solid #e2e8f0',
  padding: '12px',
  whiteSpace: 'nowrap'
};