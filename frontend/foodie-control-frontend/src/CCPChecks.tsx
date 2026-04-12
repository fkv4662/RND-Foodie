import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Task {
  id: number;
  name: string;
  time: string;
  temperature: string;
  notes: string;
  status: string | null;
}

export default function CCPChecks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: "Hot food Checks", time: new Date().toLocaleTimeString(), temperature: "", notes: "", status: null },
    { id: 2, name: "Cold Storage", time: new Date().toLocaleTimeString(), temperature: "", notes: "", status: null },
    { id: 3, name: "Delivery Check", time: new Date().toLocaleTimeString(), temperature: "", notes: "", status: null },
  ]);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const completed = tasks.filter((t) => t.status !== null).length;

  const handleStatus = (id: number, status: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const handleTemp = (id: number, value: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, temperature: value } : t)));
  };

  const handleNotes = (id: number, value: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, notes: value } : t)));
  };

  const handleSaveAll = async () => {
    try {
      for (const task of tasks) {
        if (task.status !== null) {
          await fetch("http://localhost:5000/api/ccp/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              task_name: task.name,
              temperature: parseFloat(task.temperature) || 0,
              time_recorded: task.time,
              notes: task.notes,
              status: task.status
            })
          });
        }
      }
      setSaved(true);
      setError("");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save. Make sure backend is running!");
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
        <button onClick={() => navigate('/ccp')} style={{ padding: "8px 15px", cursor: "pointer", backgroundColor: "black", color: "white", border: "none", borderRadius: "4px" }}>
          ← Back to CCP
        </button>
      </div>

      <div style={{ padding: "20px" }}>
        {error && (
          <div style={{ padding: "10px", marginBottom: "15px", backgroundColor: "#ffe6e6", border: "1px solid red", borderRadius: "4px", color: "red" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Dashboard Summary */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "4px", marginBottom: "20px" }}>
          <div style={{ fontWeight: "bold", fontSize: "18px" }}>Chef Dashboard</div>
          <div style={{ fontWeight: "bold", fontSize: "16px", marginTop: "5px" }}>Daily Food Safety Input</div>
          <div style={{ color: "#555", marginTop: "5px" }}>Enter today's Food safety readings. Automatic timestamps are added.</div>
          <div style={{ marginTop: "15px", padding: "10px", borderLeft: "4px solid green", backgroundColor: "#f9f9f9" }}>
            ✅ Today {completed}/{tasks.length} CCP checks completed
          </div>
          <div style={{ marginTop: "10px", padding: "10px", borderLeft: "4px solid orange", backgroundColor: "#f9f9f9" }}>
            🕐 Next due: Hot Holding 11:30 AM
          </div>
        </div>

        {/* Daily CCP Tasks Table */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "4px" }}>
          <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "15px" }}>Daily CCP TASKS</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>CCP Task</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Temperature (°C)</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Time</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Notes</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px 10px" }}>{task.name}</td>
                  <td style={{ padding: "12px 10px" }}>
                    <input
                      type="number"
                      placeholder="Enter temp"
                      value={task.temperature}
                      onChange={(e) => handleTemp(task.id, e.target.value)}
                      style={{ width: "100px", padding: "5px", border: "1px solid #ddd", borderRadius: "4px" }}
                    />
                  </td>
                  <td style={{ padding: "12px 10px" }}>Auto ({task.time})</td>
                  <td style={{ padding: "12px 10px" }}>
                    <input
                      placeholder="Notes..."
                      value={task.notes}
                      onChange={(e) => handleNotes(task.id, e.target.value)}
                      style={{ width: "120px", padding: "5px", border: "1px solid #ddd", borderRadius: "4px" }}
                    />
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <button onClick={() => handleStatus(task.id, "done")} style={{ marginRight: "5px", backgroundColor: task.status === "done" ? "green" : "white", color: task.status === "done" ? "white" : "black", border: "1px solid green", padding: "5px 10px", cursor: "pointer", borderRadius: "4px" }}>✅</button>
                    <button onClick={() => handleStatus(task.id, "skip")} style={{ backgroundColor: task.status === "skip" ? "red" : "white", color: task.status === "skip" ? "white" : "black", border: "1px solid red", padding: "5px 10px", cursor: "pointer", borderRadius: "4px" }}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button onClick={handleSaveAll} style={{ backgroundColor: "green", color: "white", padding: "10px 20px", border: "none", cursor: "pointer", borderRadius: "4px" }}>✅ Save ALL</button>
            <button onClick={() => setTasks(tasks.map(t => ({ ...t, temperature: "", notes: "", status: null })))} style={{ backgroundColor: "red", color: "white", padding: "10px 20px", border: "none", cursor: "pointer", borderRadius: "4px" }}>❌ Cancel</button>
            <button style={{ backgroundColor: "black", color: "white", padding: "10px 20px", border: "none", cursor: "pointer", borderRadius: "4px", marginLeft: "auto" }}>Submit Report</button>
          </div>

          {saved && (
            <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#e6ffe6", border: "1px solid green", borderRadius: "4px", color: "green", fontWeight: "bold" }}>
              ✅ All CCP tasks saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}