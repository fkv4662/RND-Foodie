import React, { useState } from "react";

const HotFoodCheck = () => {
  const [foodItem, setFoodItem] = useState("");
  const [temperature, setTemperature] = useState("");
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isSafe = temperature >= 75;

  const handleSave = async () => {
    if (!foodItem || !temperature) {
      setError("Please enter food item and temperature!");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/ccp/hotfood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food_item: foodItem,
          batch_id: "Tray A",
          temperature: parseFloat(temperature),
          action_taken: action,
          notes: notes
        })
      });
      const data = await response.json();
      if (data.message) {
        setSaved(true);
        setError("");
        setFoodItem("");
        setTemperature("");
        setAction("");
        setNotes("");
        setTimeout(() => setSaved(false), 3000);
      }
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

      {/* Top Nav */}
      <div style={{ display: "flex", backgroundColor: "white", borderBottom: "3px solid black" }}>
        {["SCHEDULE", "NOTIFICATIONS", "ACCOUNT", "SUPPORT"].map((item) => (
          <div key={item} style={{ padding: "15px 30px", fontWeight: "bold", backgroundColor: "black", color: "white", cursor: "pointer", border: "1px solid black" }}>
            {item}
          </div>
        ))}
      </div>

      <div style={{ padding: "20px" }}>
        {/* Search */}
        <input placeholder="🔍 Search..." style={{ width: "300px", padding: "10px", marginBottom: "20px", border: "2px solid green", borderRadius: "4px" }} />

        {/* Temperature Status */}
        {temperature && (
          <div style={{ padding: "10px 15px", marginBottom: "15px", backgroundColor: isSafe ? "#e6ffe6" : "#ffe6e6", border: `1px solid ${isSafe ? "green" : "red"}`, borderRadius: "4px", fontWeight: "bold", color: isSafe ? "green" : "red" }}>
            {isSafe ? `✅ Safe - ${temperature}°C meets CCP > 75°C` : `❌ Warning - ${temperature}°C is below CCP target of 75°C`}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ padding: "10px", marginBottom: "15px", backgroundColor: "#ffe6e6", border: "1px solid red", borderRadius: "4px", color: "red" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "4px" }}>
          <div style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "20px" }}>HOT FOOD CHECK</div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "15px 10px", fontWeight: "bold", width: "200px" }}>Food Item</td>
                <td style={{ padding: "15px 10px" }}>
                  <input
                    placeholder="Enter any food name (e.g. chicken curry, pasta)"
                    value={foodItem}
                    onChange={(e) => setFoodItem(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  />
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "15px 10px", fontWeight: "bold" }}>Batch / Tray ID</td>
                <td style={{ padding: "15px 10px", color: "#555" }}>Tray A (Auto)</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "15px 10px", fontWeight: "bold" }}>Time</td>
                <td style={{ padding: "15px 10px", color: "#555" }}>{new Date().toLocaleTimeString()} (Auto)</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "15px 10px", fontWeight: "bold" }}>Temperature (°C)</td>
                <td style={{ padding: "15px 10px" }}>
                  <input
                    type="number"
                    placeholder="Enter temperature"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    style={{ width: "200px", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  />
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "15px 10px", fontWeight: "bold" }}>Action</td>
                <td style={{ padding: "15px 10px" }}>
                  <input
                    placeholder="Describe action if below 75°C"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ padding: "15px 10px", fontWeight: "bold" }}>Notes</td>
                <td style={{ padding: "15px 10px" }}>
                  <input
                    placeholder="optional"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Buttons */}
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
            <button onClick={handleSave} style={{ backgroundColor: "green", color: "white", padding: "10px 25px", border: "none", cursor: "pointer", borderRadius: "4px", fontWeight: "bold" }}>
              ✅ Save
            </button>
            <button onClick={() => { setFoodItem(""); setTemperature(""); setAction(""); setNotes(""); setError(""); }} style={{ backgroundColor: "red", color: "white", padding: "10px 25px", border: "none", cursor: "pointer", borderRadius: "4px", fontWeight: "bold" }}>
              ❌ Cancel
            </button>
          </div>

          {/* Success Message */}
          {saved && (
            <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#e6ffe6", border: "1px solid green", borderRadius: "4px", color: "green", fontWeight: "bold" }}>
              ✅ Entry saved successfully to database!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotFoodCheck;