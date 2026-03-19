import React, { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    date: "",
    time: "",
    reported_by: "",
    description: "",
    action_taken: "",
    status: "Open"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await response.json();
    alert(data.message);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">KITCHEN APP</div>
        <nav className="sidebar-nav">
          <button className="nav-item">HOME</button>
          <button className="nav-item">CCP</button>
          <button className="nav-item nav-item-active">DIARY</button>
          <button className="nav-item">Tasks</button>
          <button className="nav-item">Delivery</button>
          <button className="nav-item">ADMIN</button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="main">
        <header className="main-header">
          <h1>Diary / Incident Log</h1>
          <p className="subtitle">
            Record all incidents, equipment failures, pest sightings, and other issues that occur in the kitchen.
            This log is required for council audits and helps track how problems were resolved.
          </p>
        </header>

        <section className="card">
          <h2 className="card-title">Add New Entry</h2>

          <form className="form" onSubmit={handleSubmit}>
            <div className="row">
              <div className="field">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Time</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Reported By</label>
              <input
                type="text"
                name="reported_by"
                placeholder="Your name"
                value={form.reported_by}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Issue / Incident Description</label>
              <textarea
                name="description"
                placeholder="Describe what happened... (e.g., Fridge 2 not cooling, rat spotted, equipment broken)"
                value={form.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="field">
              <label>Action Taken</label>
              <textarea
                name="action_taken"
                placeholder="Describe what you did to fix it... (you can add more updates later)"
                value={form.action_taken}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            <div className="field">
              <label>Status</label>
              <div className="status-options">
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Open"
                    checked={form.status === "Open"}
                    onChange={handleChange}
                  />
                  Open
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="In Progress"
                    checked={form.status === "In Progress"}
                    onChange={handleChange}
                  />
                  In Progress
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Resolved"
                    checked={form.status === "Resolved"}
                    onChange={handleChange}
                  />
                  Resolved
                </label>
              </div>
            </div>

            <div className="buttons-row">
              <button type="button" className="btn btn-secondary">
                Add Photo
              </button>
              <div className="buttons-right">
                <button type="button" className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Entry
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
