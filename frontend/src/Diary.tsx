import { useState } from "react";
import "./App.css";

export default function Diary() {
  const [form, setForm] = useState({
    date: "",
    time: "",
    reported_by: "",
    description: "",
    action_taken: "",
    status: "Open",
  });

  const [data, setData] = useState<any[]>([]);
  const [showData, setShowData] = useState(false);

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
        fetchData();
      }
    } catch {
      alert("Server error");
    }
  };

  const fetchData = async () => {
    const res = await fetch("http://localhost:4000/api/diary");
    const result = await res.json();
    setData(result);
  };

  const toggleData = () => {
    if (!showData) fetchData();
    setShowData(!showData);
  };

  return (
    <div className="main">
      <div className="card">

        {/* HEADER */}
        <div className="header-row">
          <h2>Add New Entry</h2>
          <button className="btn-secondary" onClick={toggleData}>
            {showData ? "Hide Data" : "View Data"}
          </button>
        </div>

        {/* FORM */}
        <div className="form">

          <div className="row">
            <div className="field">
              <label>Date</label>
              <input type="date" name="date" onChange={handleChange} />
            </div>

            <div className="field">
              <label>Time</label>
              <input type="time" name="time" onChange={handleChange} />
            </div>
          </div>

          <div className="field">
            <label>Reported By</label>
            <input name="reported_by" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea name="description" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Action Taken</label>
            <textarea name="action_taken" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Status</label>
            <div className="status">
              <label><input type="radio" name="status" value="Open" defaultChecked onChange={handleChange}/> Open</label>
              <label><input type="radio" name="status" value="In Progress" onChange={handleChange}/> In Progress</label>
              <label><input type="radio" name="status" value="Resolved" onChange={handleChange}/> Resolved</label>
            </div>
          </div>

          <button className="photo-btn">Add Photo</button>

          <div className="actions">
            <button className="cancel">Cancel</button>
            <button className="save" onClick={handleSubmit}>
              Save Entry
            </button>
          </div>
        </div>

        {/* TABLE */}
        {showData && (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Reported By</th>
                <th>Description</th>
                <th>Action</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.time}</td>
                  <td>{item.reported_by}</td>
                  <td>{item.description}</td>
                  <td>{item.action_taken}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}