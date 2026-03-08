import React, { useState } from "react";

const Schedule = () => {
  const [showForm, setShowForm] = useState(false);

  const weekDays = [
    {
      day: "MONDAY",
      tasks: [
        { time: "8:00 AM", name: "CCP HOT FOODS", assigned: "Shazia" },
        { time: "10:00 AM", name: "DISPOSAL CHECK", assigned: "Tommy" },
        { time: "2:00 AM", name: "CCP COLD FOODS", assigned: "Rojan" },
      ],
    },
    {
      day: "TUESDAY",
      tasks: [
        { time: "8:00 AM", name: "CCP HOT FOOD", assigned: "Shazia" },
        { time: "10:00 AM", name: "DISPOSAL CHECK", assigned: "Tommy" },
        { time: "2:00 AM", name: "CCP COLD FOOD", assigned: "Rojan" },
      ],
    },
    {
      day: "WEDNESDAY",
      tasks: [
        { time: "8:00 AM", name: "CCP HOT FOOD", assigned: "Shazia" },
        { time: "10:00 AM", name: "DISPOSAL CHECK", assigned: "Tommy" },
        { time: "2:00 AM", name: "CCP COLD FOOD", assigned: "Rojan" },
      ],
    },
    {
      day: "THURSDAY",
      tasks: [
        { time: "8:00 AM", name: "CCP HOT FOOD", assigned: "Shazia" },
        { time: "10:00 AM", name: "DISPOSAL CHECK", assigned: "Tommy" },
        { time: "2:00 AM", name: "CCP COLD FOOD", assigned: "Rojan" },
      ],
    },
    {
      day: "FRIDAY",
      tasks: [
        { time: "8:00 AM", name: "CCP HOT FOOD", assigned: "Shazia" },
        { time: "10:00 AM", name: "DISPOSAL CHECK", assigned: "Tommy" },
        { time: "2:00 AM", name: "CCP COLD FOOD", assigned: "Rojan" },
      ],
    },
    { day: "SATURDAY", tasks: [] },
    { day: "SUNDAY", tasks: [] },
  ];

  const recurringTasks = [
    { name: "Hot food Temperature check", assigned: "Shazia", frequency: "Every 2 hours" },
    { name: "Cold storage temperature check", assigned: "Rojan", frequency: "Every 4 hours" },
    { name: "Disposal inspection", assigned: "Tommy", frequency: "Daily at 10 AM" },
    { name: "Dining Area Cleaning", assigned: "All staff (Taha)", frequency: "After each service" },
    { name: "Pest control check", assigned: "Tharsikan", frequency: "Weekly" },
  ];

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ backgroundColor: "black", color: "white", padding: "20px 30px", fontSize: "32px", fontWeight: "bold" }}>
        FOODIE CONTROL PLAN
      </div>

      {/* Top Nav */}
      <div style={{ display: "flex", backgroundColor: "white", borderBottom: "3px solid black" }}>
        {["SCHEDULE", "NOTIFICATIONS", "ACCOUNT", "SUPPORT"].map((item) => (
          <div key={item} style={{ padding: "15px 30px", fontWeight: "bold", backgroundColor: item === "SCHEDULE" ? "white" : "black", color: item === "SCHEDULE" ? "black" : "white", cursor: "pointer", border: "1px solid black" }}>
            {item}
          </div>
        ))}
      </div>

      <div style={{ padding: "20px" }}>
        {/* Add Task Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: "black", color: "white", padding: "10px 20px", fontWeight: "bold", cursor: "pointer", border: "none" }}>
            + Add Tasks
          </button>
        </div>

        {/* Weekly Schedule */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          {weekDays.map((day) => (
            <div key={day.day} style={{ backgroundColor: "white", padding: "15px", borderRadius: "4px" }}>
              <div style={{ fontWeight: "bold", marginBottom: "10px" }}>{day.day}</div>
              {day.tasks.length === 0 ? (
                <div style={{ color: "#999", padding: "10px", backgroundColor: "#f9f9f9" }}>NO TASKS ARE SCHEDULED</div>
              ) : (
                day.tasks.map((task, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", marginBottom: "5px", backgroundColor: "#f5f5f5", borderLeft: "4px solid black" }}>
                    <span>{task.time} - {task.name}</span>
                    <span style={{ color: "#555" }}>Assigned: {task.assigned}</span>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>

        {/* Recurring Tasks */}
        <div style={{ marginTop: "20px", backgroundColor: "white", padding: "15px", borderRadius: "4px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "10px" }}>Recurring Tasks</div>
          {recurringTasks.map((task, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
              <span>{task.name} assigned to <strong>{task.assigned}</strong></span>
              <span style={{ color: "#555" }}>Frequency: {task.frequency}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;