import { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import "./App.css";

export default function Diary() {
  const savedUser = localStorage.getItem("user");
  const user = savedUser ? JSON.parse(savedUser) : null;
  const role = user?.role || "";

  const canEditDiary = role === "CHEF" || role === "MANAGER";

  const emptyForm = {
    date: "",
    time: "",
    reported_by: user?.username || "",
    description: "",
    action_taken: "",
    status: "Open",
  };

  const [form, setForm] = useState(emptyForm);
  const [data, setData] = useState<any[]>([]);
  const [showData, setShowData] = useState(role === "AUDITOR");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Saved successfully!");
        setForm(emptyForm);
        fetchData();
      } else {
        alert("Failed to save entry");
      }
    } catch {
      alert("Server error");
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/diary");
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch {
      alert("Failed to load diary logs");
      setData([]);
    }
  };

  const toggleData = () => {
    if (!showData) fetchData();
    setShowData(!showData);
  };

  if (role === "AUDITOR" && data.length === 0 && showData) {
    fetchData();
  }

  return (
    <DashboardLayout title="DIARY">
      <div style={pageWrap}>
        {canEditDiary && (
          <div style={cardStyle}>
            <div style={headerRowStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: "26px" }}>Add New Entry</h2>
                <p style={{ margin: "6px 0 0", color: "#666" }}>
                  Record diary incidents, actions, and status updates.
                </p>
              </div>

              <button style={secondaryButtonStyle} onClick={toggleData}>
                {showData ? "Hide Diary Logs" : "View Diary Logs"}
              </button>
            </div>

            <div style={formStyle}>
              <div style={twoColumnStyle}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Date</label>
                  <input
                    style={inputStyle}
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Time</label>
                  <input
                    style={inputStyle}
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Reported By</label>
                <input
                  style={inputStyle}
                  name="reported_by"
                  value={form.reported_by}
                  onChange={handleChange}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={textareaStyle}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Action Taken</label>
                <textarea
                  style={textareaStyle}
                  name="action_taken"
                  value={form.action_taken}
                  onChange={handleChange}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Status</label>
                <div style={statusStyle}>
                  {["Open", "In Progress", "Resolved"].map((status) => (
                    <label key={status} style={radioLabelStyle}>
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={form.status === status}
                        onChange={handleChange}
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>

              <div style={actionsStyle}>
                <button
                  style={cancelButtonStyle}
                  onClick={() => setForm(emptyForm)}
                >
                  Cancel
                </button>

                <button style={saveButtonStyle} onClick={handleSubmit}>
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {!canEditDiary && (
          <div style={cardStyle}>
            <div style={headerRowStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: "26px" }}>Auditor View</h2>
                <p style={{ margin: "6px 0 0", color: "#666" }}>
                 You can only view logs
                </p>
              </div>

              <button style={secondaryButtonStyle} onClick={fetchData}>
                🔄 Refresh Logs
              </button>
            </div>
          </div>
        )}

        {showData && (
          <div style={cardStyle}>
            <div style={headerRowStyle}>
              <div>
                <h2 style={{ margin: 0, fontSize: "24px" }}>Diary Logs</h2>
                <p style={{ margin: "6px 0 0", color: "#666" }}>
                  All saved diary records.
                </p>
              </div>

              <button style={secondaryButtonStyle} onClick={fetchData}>
                🔄 Refresh Logs
              </button>
            </div>

            {data.length === 0 ? (
              <div style={emptyStyle}>No diary logs found.</div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: "#ddd" }}>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Time</th>
                    <th style={thStyle}>Reported By</th>
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Action Taken</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={tdStyle}>{item.date}</td>
                      <td style={tdStyle}>{item.time}</td>
                      <td style={tdStyle}>{item.reported_by}</td>
                      <td style={tdStyle}>{item.description}</td>
                      <td style={tdStyle}>{item.action_taken}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            ...statusBadgeStyle,
                            background:
                              item.status === "Resolved"
                                ? "#2ecc71"
                                : item.status === "In Progress"
                                ? "#f39c12"
                                : "#3498db",
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
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

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const twoColumnStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#333",
};

const inputStyle: React.CSSProperties = {
  padding: "12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "14px",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "80px",
  resize: "vertical",
};

const statusStyle: React.CSSProperties = {
  display: "flex",
  gap: "18px",
  flexWrap: "wrap",
};

const radioLabelStyle: React.CSSProperties = {
  display: "flex",
  gap: "6px",
  alignItems: "center",
  fontSize: "14px",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "8px",
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

const cancelButtonStyle: React.CSSProperties = {
  ...secondaryButtonStyle,
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
  verticalAlign: "top",
};

const statusBadgeStyle: React.CSSProperties = {
  color: "#fff",
  padding: "5px 10px",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: 700,
  display: "inline-block",
};