import { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";

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
    <DashboardLayout title="CCP Logs">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            background: "#efefef",
            border: "1px solid #bdbdbd",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            padding: "16px",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "20px", marginBottom: "12px" }}>
            CCP Logs — All Records
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setActiveTab("sensor")}
              style={{
                padding: "12px 22px",
                backgroundColor: activeTab === "sensor" ? "black" : "white",
                color: activeTab === "sensor" ? "white" : "black",
                border: "2px solid black",
                cursor: "pointer",
                fontWeight: "bold",
                borderRadius: "6px",
              }}
            >
              CCP Sensor Logs
            </button>

            <button
              onClick={() => setActiveTab("manual")}
              style={{
                padding: "12px 22px",
                backgroundColor: activeTab === "manual" ? "black" : "white",
                color: activeTab === "manual" ? "white" : "black",
                border: "2px solid black",
                cursor: "pointer",
                fontWeight: "bold",
                borderRadius: "6px",
              }}
            >
              CCP Manual Logs
            </button>
          </div>
        </div>

        {loading && (
          <div style={cardStyle}>
            <div style={{ padding: "20px", textAlign: "center" }}>
              Loading logs...
            </div>
          </div>
        )}

        {activeTab === "sensor" && !loading && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>CCP SENSOR LOGS</div>

            {sensorLogs.length === 0 ? (
              <div style={emptyStyle}>No sensor logs yet</div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Time</th>
                    <th style={thStyle}>Temperature</th>
                    <th style={thStyle}>Humidity</th>
                  </tr>
                </thead>
                <tbody>
                  {sensorLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={tdStyle}>
                        {new Date(log.created_at).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td style={tdStyle}>{log.temperature}°C</td>
                      <td style={tdStyle}>{log.humidity}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "manual" && !loading && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>CCP MANUAL LOGS</div>

            {manualLogs.length === 0 ? (
              <div style={emptyStyle}>No manual logs yet</div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Task</th>
                    <th style={thStyle}>Temperature</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {manualLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={tdStyle}>
                        {new Date(log.created_at).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>{log.task_name}</td>
                      <td style={tdStyle}>{log.temperature}°C</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            color: log.status === "done" ? "green" : "red",
                            fontWeight: "bold",
                          }}
                        >
                          {log.status === "done" ? "✅ Done" : "❌ Skipped"}
                        </span>
                      </td>
                      <td style={tdStyle}>{log.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #cfcfcf",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
  padding: "20px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontWeight: "bold",
  fontSize: "18px",
  marginBottom: "15px",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "2px solid #ddd",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
};

const emptyStyle: React.CSSProperties = {
  padding: "20px",
  color: "#999",
  textAlign: "center",
};