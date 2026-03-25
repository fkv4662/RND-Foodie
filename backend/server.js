const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express(); // ✅ MUST BE FIRST

app.use(cors());
app.use(express.json());

console.log("🔥 CORRECT SERVER FILE RUNNING");

// ✅ Test route
app.get("/", (req, res) => {
  res.send("SERVER WORKING");
});

// ✅ MySQL connection
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "Debruyne66@@",
  database: "food_control",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.log("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ MySQL connected");
});

// ✅ POST
app.post("/incidents", (req, res) => {
  const { date, time, reported_by, description, action_taken, status } = req.body;

  const sql = `
    INSERT INTO incidents (date, time, reported_by, description, action_taken, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [date, time, reported_by, description, action_taken, status], (err) => {
    if (err) {
      console.log("❌ DB ERROR:", err);
      return res.status(500).json({ error: err });
    }

    res.json({ message: "Incident saved successfully!" });
  });
});

// ✅ GET (IMPORTANT)
app.get("/incidents", (req, res) => {
  const sql = "SELECT * FROM incidents";

  db.query(sql, (err, results) => {
    if (err) {
      console.log("❌ ERROR:", err);
      return res.status(500).json({ error: err });
    }

    console.log("🔥 DATA:", results);
    res.json(results);
  });
});

// ✅ Start server
app.listen(5000, () => {
  console.log("🚀 Backend running on port 5000");
});