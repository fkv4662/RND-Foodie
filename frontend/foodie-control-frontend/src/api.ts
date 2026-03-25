// Example API integration using fetch and axios
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api/fridge';

export async function fetchLogs() {
  const res = await fetch(`${API_BASE}/logs`);
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/alerts`);
  return res.json();
}

export async function postLog(data: { device_name: string; temperature: number; humidity: number }) {
  const res = await axios.post(`${API_BASE}/log`, data);
  return res.data;
}

// Delete a single log by id
export async function deleteLog(id: number) {
  const res = await axios.delete(`${API_BASE}/log/${id}`);
  return res.data;
}

// Delete all logs
export async function deleteAllLogs() {
  const res = await axios.delete(`${API_BASE}/logs`);
  return res.data;
}
