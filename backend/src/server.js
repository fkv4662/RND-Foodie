require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const authRouter = require("./routes/auth.routes");
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Foodie Control Backend Running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});