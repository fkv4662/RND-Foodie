import { useEffect, useState } from "react";

interface FridgeLog {
  device_name: string;
  temperature: number;
  humidity: number;
  status: string;
  recorded_at: string;
}

export default function RationalFridge() {
  const [logs, setLogs] = useState<FridgeLog[]>([]);
  const [alerts, setAlerts] = useState<FridgeLog[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    fetch("/api/fridge/logs")
      .then((res) => res.json())
      .then(setLogs);
    fetch("/api/fridge/alerts")
      .then((res) => res.json())
      .then(setAlerts);
  }, []);

  return (
    <div style={{ background: '#f7f7f7', minHeight: '100vh', fontFamily: 'Arial, sans-serif', padding: '2em' }}>
      <h1 style={{ color: '#2a4d69' }}>Rational Fridge Monitoring</h1>
      <FridgeForm onSubmit={() => {
        setTimeout(() => {
          fetch("/api/fridge/logs").then((res) => res.json()).then(setLogs);
          fetch("/api/fridge/alerts").then((res) => res.json()).then(setAlerts);
        }, 500);
      }} />
      <div style={{ marginBottom: '2em' }}>
        <button onClick={() => setShowAlerts(false)} style={{ marginRight: '1em' }}>Show All Logs</button>
        <button onClick={() => setShowAlerts(true)}>Show Alerts Only</button>
      </div>
      {!showAlerts ? (
        <FridgeLogsTable logs={logs} />
      ) : (
        <FridgeLogsTable logs={alerts} />
      )}
    </div>
  );
}

function FridgeForm({ onSubmit }: { onSubmit: () => void }) {
  const [device_name, setDeviceName] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [result, setResult] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await fetch("/api/fridge/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_name,
            temperature: parseFloat(temperature),
            humidity: parseFloat(humidity),
          }),
        });
        const data = await res.json();
        setResult(JSON.stringify(data, null, 2));
        setDeviceName("");
        setTemperature("");
        setHumidity("");
        onSubmit();
      }}
      style={{ background: '#fff', padding: '1em', marginBottom: '2em', borderRadius: '8px', boxShadow: '0 2px 8px #0001' }}
    >
      <label>Device Name: <input type="text" value={device_name} onChange={e => setDeviceName(e.target.value)} required /></label>
      <label>Temperature (°C): <input type="number" value={temperature} onChange={e => setTemperature(e.target.value)} required /></label>
      <label>Humidity (%): <input type="number" value={humidity} onChange={e => setHumidity(e.target.value)} required /></label>
      <button type="submit">Submit Log</button>
      <div style={{ marginTop: '1em' }}>{result && <pre>{result}</pre>}</div>
    </form>
  );
}

function FridgeLogsTable({ logs }: { logs: FridgeLog[] }) {
  return (
    <div style={{ background: '#fff', padding: '1em', borderRadius: '8px', boxShadow: '0 2px 8px #0001' }}>
      <h2>{logs.length && logs[0].status === 'ALERT' ? 'Alerts Only' : 'All Fridge Logs'}</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1em' }}>
        <thead>
          <tr>
            <th>Device</th>
            <th>Temperature (°C)</th>
            <th>Humidity (%)</th>
            <th>Status</th>
            <th>Recorded At</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={idx} style={log.status === 'ALERT' ? { background: '#ffeaea' } : {}}>
              <td>{log.device_name}</td>
              <td>{log.temperature}</td>
              <td>{log.humidity}</td>
              <td>{log.status}</td>
              <td>{log.recorded_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
