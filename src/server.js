require('dotenv').config();
require('./db');

const express = require('express');
const cors = require('cors');
const app = express();

const { seedAdmin } = require('./seedAdmin');
const { initTables } = require('./initTables');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

// Routers
const ovenRouter = require('./routes/oven.routes');
const authRouter = require('./routes/auth.routes');
app.use('/api/oven', ovenRouter);
app.use('/api/auth', authRouter);

// Database test route
const { pool } = require('./db');
app.get('/api/db-test', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ success: true, message: 'Database connection successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection failed', error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Foodie Control Backend Running');
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  await initTables();
  console.log(`Server running on http://localhost:${PORT}`);
  await seedAdmin();
});