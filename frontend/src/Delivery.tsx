import { useState } from "react";
import DashboardLayout from "./DashboardLayout";

export default function Delivery() {
  const savedUser = localStorage.getItem("user");
  const user = savedUser ? JSON.parse(savedUser) : null;
  const role = user?.role || "";

  const canEditDelivery = role === "CHEF" || role === "MANAGER";

  const [temps] = useState([
    { name: "Fridge 1 (Main)", value: 3, time: "11:30 AM" },
    { name: "Fridge 2 (Dairy)", value: 2, time: "11:30 AM" },
    { name: "Walk-in-Chiller", value: 4, time: "11:30 AM" },
  ]);

  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(role === "AUDITOR");

  const handleRecord = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ temps }),
      });

      if (res.ok) {
        alert("Temperature saved to database!");
        fetchLogs();
      } else {
        alert("Failed to save");
      }
    } catch (err) {
      console.error(err);
      alert("Backend not running");
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/delivery");
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      alert("Failed to load delivery logs");
      setLogs([]);
    }
  };

  const toggleLogs = () => {
    if (!showLogs) fetchLogs();
    setShowLogs(!showLogs);
  };

  if (role === "AUDITOR" && showLogs && logs.length === 0) {
    fetchLogs();
  }

  return (
    <DashboardLayout title="DELIVERY">
      <div style={pageWrap}>
        {canEditDelivery && (
          <div style={cardStyle}>
            <div style={headerRowStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: "26px" }}>Delivery</h2>
                <p style={{ margin: "6px 0 0", color: "#666" }}>
                  Record delivery temperature checks and monitor chilled items.
                </p>
              </div>

              <button style={secondaryButtonStyle} onClick={toggleLogs}>
                {showLogs ? "Hide Delivery Logs" : "View Delivery Logs"}
              </button>
            </div>

            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Temperature Monitoring</h3>

              {temps.map((item, index) => (
                <div key={index} style={tempRowStyle}>
                  <div>
                    <strong>{item.name}</strong>
                    <div style={targetStyle}>Target 0 - 5°C</div>
                  </div>

                  <div style={tempValueStyle}>{item.value}°C</div>
                  <div style={timeStyle}>{item.time}</div>
                  <div style={statusOkStyle}>✅</div>
                </div>
              ))}

              <button style={saveButtonStyle} onClick={handleRecord}>
                Record Temperature Check
              </button>
            </div>

            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Delivery Schedule</h3>

              {[
                ["Monday 6:00 AM", "Fonterra Dairy Milk, Cream, Butter"],
                ["Wednesday 6:30 AM", "Fonterra Dairy Milk, Yogurt"],
                ["Friday 6:00 AM", "Cheese CO NZ, Cheese varieties"],
                ["Saturday 7:00 AM", "Fonterra Dairy Milk, Cream"],
              ].map((row, index) => (
                <div key={index} style={scheduleRowStyle}>
                  <span>{row[0]}</span>
                  <span>{row[1]}</span>
                  <span style={linkStyle}>View Details</span>
                </div>
              ))}
            </div>

            <div style={warningStyle}>
              ⚠️ Action Required: Delivery check not done!
            </div>
          </div>
        )}

        {!canEditDelivery && (
          <div style={cardStyle}>
            <div style={headerRowStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: "26px" }}>
                  Auditor View
                </h2>
                <p style={{ margin: "6px 0 0", color: "#666" }}>
                  You can only view logs
                </p>
              </div>

              <button style={secondaryButtonStyle} onClick={fetchLogs}>
                🔄 Refresh Logs
              </button>
            </div>
          </div>
        )}

        {showLogs && (
          <div style={cardStyle}>
            <div style={headerRowStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: "24px" }}>
                  Delivery Logs
                </h2>
                <p style={{ margin: "6px 0 0", color: "#666" }}>
                  Saved delivery temperature records.
                </p>
              </div>

              <button style={secondaryButtonStyle} onClick={fetchLogs}>
                🔄 Refresh Logs
              </button>
            </div>

            {logs.length === 0 ? (
              <div style={emptyStyle}>No delivery logs found.</div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: "#ddd" }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Temperature</th>
                    <th style={thStyle}>Time</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={tdStyle}>{item.name}</td>
                      <td style={tdStyle}>{item.temperature}°C</td>
                      <td style={tdStyle}>{item.time}</td>
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

const pageWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #cfcfcf",
  borderRadius: "12px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
  padding: "24px",
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const sectionStyle: React.CSSProperties = {
  marginTop: "20px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  marginBottom: "12px",
};

const tempRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 60px",
  alignItems: "center",
  background: "#f8f8f8",
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "14px",
  marginBottom: "10px",
};

const targetStyle: React.CSSProperties = {
  color: "#666",
  fontSize: "13px",
  marginTop: "4px",
};

const tempValueStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
};

const timeStyle: React.CSSProperties = {
  color: "#555",
};

const statusOkStyle: React.CSSProperties = {
  fontSize: "22px",
  textAlign: "center",
};

const scheduleRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 2fr 120px",
  alignItems: "center",
  background: "#f8f8f8",
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "14px",
  marginBottom: "10px",
};

const linkStyle: React.CSSProperties = {
  color: "#1f2bff",
  fontWeight: 700,
  cursor: "pointer",
};

const warningStyle: React.CSSProperties = {
  background: "#fff3cd",
  border: "1px solid #f1c40f",
  borderRadius: "8px",
  padding: "14px",
  fontWeight: 700,
  marginTop: "20px",
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "#fff",
  color: "#000",
  border: "1px solid #aaa",
  padding: "12px 18px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
};

const saveButtonStyle: React.CSSProperties = {
  background: "#1f2bff",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  marginTop: "10px",
};

const emptyStyle: React.CSSProperties = {
  padding: "20px",
  background: "#f8f8f8",
  borderRadius: "8px",
  color: "#777",
  textAlign: "center",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
};

const thStyle: React.CSSProperties = {
  padding: "12px",
  textAlign: "left",
  fontWeight: 700,
  borderBottom: "1px solid #ccc",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
};