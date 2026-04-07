import { useEffect, useState } from "react";

interface OvenLog {
	id?: number;
	device_name: string;
	food_item?: string;
	temperature: number;
	status: string;
	recorded_at: string;
}

export default function RationalOven() {
	const [logs, setLogs] = useState<OvenLog[]>([]);
	const [alerts, setAlerts] = useState<OvenLog[]>([]);
	const [showAlerts, setShowAlerts] = useState(false);

	const alertCount = alerts.length;
	const avgTemp = logs.length ? (logs.reduce((sum, l) => sum + Number(l.temperature), 0) / logs.length).toFixed(2) : 'N/A';

	useEffect(() => {
		const fetchData = () => {
			fetch("/api/oven/logs").then((res) => res.json()).then(setLogs);
			fetch("/api/oven/alerts").then((res) => res.json()).then(setAlerts);
		};
		fetchData();
		const interval = setInterval(fetchData, 5000);
		return () => clearInterval(interval);
	}, []);

	const refresh = () => {
		fetch("/api/oven/logs").then((res) => res.json()).then(setLogs);
		fetch("/api/oven/alerts").then((res) => res.json()).then(setAlerts);
	};

	return (
		<div style={{ background: '#f7f7f7', minHeight: '100vh', fontFamily: 'Arial, sans-serif', padding: '2em' }}>
			<h1 style={{ color: '#2a4d69', marginBottom: 0 }}>Rational Oven Monitoring</h1>
			<div style={{ display: 'flex', gap: '2em', alignItems: 'center', margin: '1.5em 0 1em 0', flexWrap: 'wrap' }}>
				<div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px #0001', padding: '1em 2em', minWidth: 180, textAlign: 'center' }}>
					<div style={{ fontSize: '2.2em', color: '#e74c3c', fontWeight: 700 }}>{alertCount}</div>
					<div style={{ color: '#e74c3c', fontWeight: 600, fontSize: '1.1em' }}>Active Alerts</div>
				</div>
				<div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px #0001', padding: '1em 2em', minWidth: 180, textAlign: 'center' }}>
					<div style={{ fontSize: '2.2em', color: '#2a4d69', fontWeight: 700 }}>{avgTemp}</div>
					<div style={{ color: '#2a4d69', fontWeight: 600, fontSize: '1.1em' }}>Avg Temp (°C)</div>
				</div>
			</div>
			<OvenForm onSubmit={() => {
				setTimeout(refresh, 500);
			}} />
			<div style={{ marginBottom: '2em', display: 'flex', alignItems: 'center', gap: '1em' }}>
				<button onClick={() => setShowAlerts(false)} style={{ marginRight: '1em' }}>Show All Logs</button>
				<button onClick={() => setShowAlerts(true)}>Show Alerts Only</button>
				<button
					style={{ marginLeft: 'auto', background: '#e74c3c', color: '#fff', border: 'none', padding: '0.5em 1.5em', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
					onClick={async () => {
						if (window.confirm('Delete ALL logs? This cannot be undone.')) {
							await fetch('/api/oven/logs', { method: 'DELETE' });
							refresh();
						}
					}}
				>
					Delete All Logs
				</button>
			</div>
			{!showAlerts ? (
				<OvenLogsTable logs={logs} onDelete={async (id) => { await fetch(`/api/oven/log/${id}`, { method: 'DELETE' }); refresh(); }} />
			) : (
				<OvenLogsTable logs={alerts} onDelete={async (id) => { await fetch(`/api/oven/log/${id}`, { method: 'DELETE' }); refresh(); }} />
			)}
		</div>
	);
}

function OvenForm({ onSubmit }: { onSubmit: () => void }) {
	const [device_name, setDeviceName] = useState("");
	const [food_item, setFoodItem] = useState("");
	const [temperature, setTemperature] = useState("");
	const [result, setResult] = useState("");

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				const res = await fetch("/api/oven/log", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						device_name,
						food_item,
						temperature: parseFloat(temperature),
					}),
				});
				const data = await res.json();
				setResult(JSON.stringify(data, null, 2));
				setDeviceName("");
				setFoodItem("");
				setTemperature("");
				onSubmit();
			}}
			style={{ background: '#fff', padding: '1em', marginBottom: '2em', borderRadius: '8px', boxShadow: '0 2px 8px #0001' }}
		>
			<label>Device Name: <input type="text" value={device_name} onChange={e => setDeviceName(e.target.value)} required /></label>
			<label>Food Item: <input type="text" value={food_item} onChange={e => setFoodItem(e.target.value)} required /></label>
			<label>Temperature (°C): <input type="number" value={temperature} onChange={e => setTemperature(e.target.value)} required /></label>
			<button type="submit">Submit Log</button>
			<div style={{ marginTop: '1em' }}>{result && <pre>{result}</pre>}</div>
		</form>
	);
}

function OvenLogsTable({ logs, onDelete }: { logs: any[]; onDelete: (id: number) => void }) {
		return (
			<div style={{ background: '#fff', padding: '1.5em', borderRadius: '14px', boxShadow: '0 4px 24px #0002', marginBottom: '2em' }}>
				<h2 style={{ fontWeight: 700, fontSize: '1.5em', marginBottom: '0.5em' }}>
					{logs.length && logs[0].status === 'ALERT' ? 'Alerts Only' : 'All Oven Logs'}
				</h2>
				<table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, marginTop: '1em', fontSize: '1.1em', boxShadow: '0 1px 4px #0001' }}>
					<thead>
						<tr style={{ background: '#f0f4f8', color: '#2a4d69' }}>
							<th style={{ padding: '12px 8px', borderTopLeftRadius: '8px' }}>Device</th>
							<th style={{ padding: '12px 8px' }}>Food Item</th>
							<th style={{ padding: '12px 8px' }}>Temperature (°C)</th>
							<th style={{ padding: '12px 8px' }}>Status</th>
							<th style={{ padding: '12px 8px' }}>Recorded At</th>
							<th style={{ padding: '12px 8px', borderTopRightRadius: '8px' }}>Delete</th>
						</tr>
					</thead>
					<tbody>
						{logs.map((log, idx) => {
							const isAlert = log.status === 'ALERT';
							return (
								<tr
									key={log.id || idx}
									style={{
										background: isAlert ? '#fff0f0' : idx % 2 === 0 ? '#f9fbfd' : '#f3f6fa',
										transition: 'background 0.2s',
										borderLeft: isAlert ? '6px solid #e74c3c' : '6px solid transparent',
										fontWeight: isAlert ? 700 : 400,
										boxShadow: isAlert ? '0 2px 8px #e74c3c22' : undefined,
									}}
									onMouseOver={e => (e.currentTarget.style.background = isAlert ? '#ffeaea' : '#eaf3fa')}
									onMouseOut={e => (e.currentTarget.style.background = isAlert ? '#fff0f0' : idx % 2 === 0 ? '#f9fbfd' : '#f3f6fa')}
								>
									<td style={{ padding: '10px 8px' }}>{log.device_name}</td>
									<td style={{ padding: '10px 8px' }}>{log.food_item}</td>
									<td style={{ padding: '10px 8px', color: log.temperature < 75 ? '#e74c3c' : '#2ecc71', fontWeight: 600 }}>
										{log.temperature}
									</td>
									<td style={{ padding: '10px 8px' }}>
										{isAlert ? (
											<span style={{ color: '#e74c3c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
												<span style={{ fontSize: '1.2em' }}>⚠️</span> ALERT
											</span>
										) : (
											<span style={{ color: '#2ecc71', fontWeight: 600 }}>SAFE</span>
										)}
									</td>
									<td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '0.98em' }}>{log.recorded_at}</td>
									<td style={{ padding: '10px 8px' }}>
										<button
											style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3em 0.8em', cursor: 'pointer', fontWeight: 700, fontSize: '1em', boxShadow: '0 1px 4px #e74c3c22' }}
											onClick={() => {
												if (window.confirm('Delete this log?')) onDelete(log.id);
											}}
										>
											Delete
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
}