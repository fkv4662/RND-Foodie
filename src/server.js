require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const app = express();

const { seedAdmin } = require("./seedAdmin");

app.use(cors());
app.use(express.json());

const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'super_secret_key';

// Middleware to protect fridge.html
app.get('/fridge.html', (req, res, next) => {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }
  console.log('Token received:', token);
  if (!token) {
    console.log('No token provided');
    return res.status(401).send('Unauthorized: No token provided');
  }
  try {
    jwt.verify(token, SECRET);
    console.log('Token valid');
    return res.sendFile(__dirname + '/public/fridge.html');
  } catch (err) {
    console.log('Token verification error:', err.message);
    return res.status(401).send('Unauthorized: Invalid token');
  }
});

app.use(express.static(__dirname + '/public'));

// Routers
const rationalFridgeRouter = require('./routes/rationalFridge.routes');
const authRouter = require('./routes/auth.routes');
app.use('/api/fridge', rationalFridgeRouter);
app.use('/api/auth', authRouter);

app.get("/", (req, res) => {
  res.send("Foodie Control Backend Running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await seedAdmin();
});