require("dotenv").config();
require("./db");


const express = require("express");
const cors = require("cors");
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));


// Routers
const rationalFridgeRouter = require('./routes/rationalFridge.routes');
app.use('/api/fridge', rationalFridgeRouter);

app.get("/", (req, res) => {
  res.send("Foodie Control Backend Running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});