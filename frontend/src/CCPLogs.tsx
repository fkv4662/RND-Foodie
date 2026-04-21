import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface SensorLog {
  id: number;
  temperature: number;
  humidity: number;
  created_at: string;
}

interface ManualLog {
  id: number;
  task_name: string;
  temperature: number;
  notes: string;
  status: string;
  created_at: string;
}

export default function CCPLogs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sensor");
  const [sensorLogs, setSensorLogs] = useState<SensorLog[]>([]);
  const [manualLogs, setManualLogs] = useState<ManualLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response1 = await fetch("http://localhost:4000/api/ccp/logs");
      const data1 = await response1.json();
      setSensorLogs(data1);

      const response2 = await fetch("http://localhost:4000/api/ccp/tasks");
      const data2 = await response2.json();
      setManualLogs(data2);

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ backgroundColor: "black", color: "white", padding: "20px 30px", fontSize: "32px", fontWeight: "bold" }}>
        FOODIE CONTROL PLAN
      </div>

      {/* Back button */}
      <div style={{ padding: "10px 20px" }}>
        <button onClick={() => navigate('/tasks')} style={{ padding: "8px 15px", cursor: "pointer", backgroundColor: "black", color: "white", border: "none", borderRadius: "4px" }}>
          ← Back to CCP
        </button>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: "15px", color: "#555", fontWeight: "bold" }}>
          CCP Logs — All Records
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={() => setActiveTab("sensor")}
            style={{ padding: "10px 20px", backgroundColor: activeTab === "sensor" ? "black" : "white", color: activeTab === "sensor" ? "white" : "black", border: "2px solid black", cursor: "pointer", fontWeight: "bold", borderRadius: "4px" }}>
            CCP Sensor Logs
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            style={{ padding: "10px 20px", backgroundColor: activeTab === "manual" ? "black" : "white", color: activeTab === "manual" ? "white" : "black", border: "2px solid black", cursor: "pointer", fontWeight: "bold", borderRadius: "4px" }}>
            CCP Manual Logs
          </button>
        </div>

        {loading && (
          <div style={{ padding: "20px", textAlign: "center" }}>Loading logs...</div>
        )}

        {/* Sensor Logs */}
        {activeTab === "sensor" && !loading && (
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "4px" }}>
            <div style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "15px" }}>CCP SENSOR LOGS</div>
            {sensorLogs.length === 0 ? (
              <div style={{ padding: "20px", color: "#999", textAlign: "center" }}>No sensor logs yet</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Date</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Time</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Temperature</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Humidity</th>
                  </tr>
                </thead>
                <tbody>
                  {sensorLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px" }}>{new Date(log.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: "12px" }}>{new Date(log.created_at).toLocaleTimeString()}</td>
                      <td style={{ padding: "12px" }}>{log.temperature}°C</td>
                      <td style={{ padding: "12px" }}>{log.humidity}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Manual Logs */}
        {activeTab === "manual" && !loading && (
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "4px" }}>
            <div style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "15px" }}>CCP Manual LOGS</div>
            {manualLogs.length === 0 ? (
              <div style={{ padding: "20px", color: "#999", textAlign: "center" }}>No manual logs yet</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Date</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Task</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Temperature</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {manualLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px" }}>{new Date(log.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: "12px" }}>{log.task_name}</td>
                      <td style={{ padding: "12px" }}>{log.temperature}°C</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ color: log.status === "done" ? "green" : "red", fontWeight: "bold" }}>
                          {log.status === "done" ? "✅ Done" : "❌ Skipped"}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>{log.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}