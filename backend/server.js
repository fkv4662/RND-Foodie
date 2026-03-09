const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Debruyne66@@", // your MySQL password
  database: "food_control"
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected");
});

// API route: Save an incident
app.post("/incidents", (req, res) => {
  const { date, time, reported_by, description, action_taken, status } = req.body;

  const sql = `
    INSERT INTO incidents (date, time, reported_by, description, action_taken, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [date, time, reported_by, description, action_taken, status],
    (err) => {
      if (err) return res.json({ error: err });
      res.json({ message: "Incident saved successfully!" });
    }
  );
});

// Start backend server
app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
