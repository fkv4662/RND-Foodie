import { useState } from "react";
import "./App.css";

export default function Delivery() {
  const [temps, setTemps] = useState([
    { name: "Fridge 1 (Main)", value: 3, time: "11:30 AM" },
    { name: "Fridge 2 (Dairy)", value: 2, time: "11:30 AM" },
    { name: "Walk-in-Chiller", value: 4, time: "11:30 AM" },
  ]);

  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // ✅ SAVE DATA TO BACKEND
  const handleRecord = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ temps }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Temperature saved to database!");
        console.log(data);
      } else {
        alert("❌ Failed to save");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Backend not running");
    }
  };

  // ✅ FETCH SAVED DATA
  const fetchLogs = async () => {
    const res = await fetch("http://localhost:4000/api/delivery");
    const data = await res.json();
    setLogs(data);
  };

  const toggleLogs = () => {
    if (!showLogs) fetchLogs();
    setShowLogs(!showLogs);
  };

  return (
    <div className="main">
      <div className="card">

        {/* TITLE */}
        <h2>Delivery</h2>

        {/* TEMPERATURE SECTION */}
        <div className="section">
          <h3>Temperature Monitoring</h3>

          {temps.map((item, index) => (
            <div key={index} className="temp-row">
              <div>
                <strong>{item.name}</strong>
                <div className="target">Target 0 - 5°C</div>
              </div>

              <div className="temp-value">{item.value} °C</div>

              <div className="time">{item.time}</div>

              <div className="status">✅</div>
            </div>
          ))}

          <button className="record-btn" onClick={handleRecord}>
            Record Temperature Check
          </button>

          {/* VIEW DATA BUTTON */}
          <button onClick={toggleLogs} style={{ marginLeft: "10px" }}>
            {showLogs ? "Hide Data" : "View Data"}
          </button>
        </div>

        {/* DELIVERY SCHEDULE */}
        <div className="section">
          <h3>Delivery Schedule</h3>

          <div className="schedule-row">
            <span>Monday 6:00 AM</span>
            <span>Fonterra Dairy Milk, Cream, Butter</span>
            <span className="link">View Details</span>
          </div>

          <div className="schedule-row">
            <span>Wednesday 6:30 AM</span>
            <span>Fonterra Dairy Milk, Yogurt</span>
            <span className="link">View Details</span>
          </div>

          <div className="schedule-row">
            <span>Friday 6:00 AM</span>
            <span>Cheese CO NZ, Cheese varieties</span>
            <span className="link">View Details</span>
          </div>

          <div className="schedule-row">
            <span>Saturday 7:00 AM</span>
            <span>Fonterra Dairy Milk, Cream</span>
            <span className="link">View Details</span>
          </div>
        </div>

        {/* WARNING */}
        <div className="warning">
          ⚠️ Action Required: Delivery check not done!
        </div>

        {/* DATA TABLE */}
        {showLogs && (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Temperature</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.temperature} °C</td>
                  <td>{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}