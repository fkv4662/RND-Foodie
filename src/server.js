require("dotenv").config();
require("./db");

const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Foodie Control Backend Running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});