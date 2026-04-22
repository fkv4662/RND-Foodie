import React, { useState } from "react";
import "./App.css";

function Diary() {
  const [form, setForm] = useState({
    date: "",
    time: "",
    reported_by: "",
    description: "",
    action_taken: "",
    status: "Open"
  });

  const [incidents, setIncidents] = useState([]);
  const [showData, setShowData] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/incidents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await response.json();
    alert(data.message);

    setForm({
      date: "",
      time: "",
      reported_by: "",
      description: "",
      action_taken: "",
      status: "Open"
    });

    fetchIncidents();
    setShowData(true);
  };

  const fetchIncidents = async () => {
    const res = await fetch("http://localhost:5000/incidents");
    const data = await res.json();
    setIncidents(data);
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

      {/* Main */}
      <main className="main">
        <header className="main-header">
          <h1>Diary / Incident Log</h1>
          <p className="subtitle">
            Record all incidents, equipment failures, pest sightings, and other issues.
          </p>
        </header>

        <section className="card">

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Add New Entry</h2>

            <button
              className="btn btn-secondary"
              onClick={async () => {
                await fetchIncidents();
                setShowData(!showData);
              }}
            >
              {showData ? "Hide Data" : "View Data"}
            </button>
          </div>

          {/* FORM */}
          <form className="form" onSubmit={handleSubmit}>
            <div className="row">
              <div className="field">
                <label>Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>

              <div className="field">
                <label>Time</label>
                <input type="time" name="time" value={form.time} onChange={handleChange} required />
              </div>
            </div>

            <div className="field">
              <label>Reported By</label>
              <input type="text" name="reported_by" value={form.reported_by} onChange={handleChange} required />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} required />
            </div>

            <div className="field">
              <label>Action Taken</label>
              <textarea name="action_taken" value={form.action_taken} onChange={handleChange} rows={3} required />
            </div>

            <div className="field">
              <label>Status</label>
              <div className="status-options">
                <label><input type="radio" name="status" value="Open" checked={form.status === "Open"} onChange={handleChange}/> Open</label>
                <label><input type="radio" name="status" value="In Progress" checked={form.status === "In Progress"} onChange={handleChange}/> In Progress</label>
                <label><input type="radio" name="status" value="Resolved" checked={form.status === "Resolved"} onChange={handleChange}/> Resolved</label>
              </div>
            </div>

            <div className="buttons-row">
              <button type="button" className="btn btn-secondary">Add Photo</button>

              <div className="buttons-right">
                <button type="button" className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Entry</button>
              </div>
            </div>
          </form>

          {/* TABLE */}
          {showData && (
            <div style={{ marginTop: "20px" }}>
              <h3>All Incidents</h3>

              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Reported By</th>
                    <th>Description</th>
                    <th>Action</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {incidents.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center" }}>No data found</td>
                    </tr>
                  ) : (
                    incidents.map((item: any) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.date?.split("T")[0]}</td>
                        <td>{item.time}</td>
                        <td>{item.reported_by}</td>
                        <td>{item.description}</td>
                        <td>{item.action_taken}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}

export default Diary;