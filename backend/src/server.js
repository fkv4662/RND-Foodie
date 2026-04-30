require('dotenv').config();
require('./db');

const express = require('express');
const cors = require('cors');
const app = express();

const { seedAdmin } = require('./seedAdmin');
const { initTables } = require('./initTables');
const { ingestMockTestoReadings } = require('./services/testoService');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

// ✅ Routers
const ovenRouter = require('./routes/oven.routes');
const authRouter = require('./routes/auth.routes');
const testoRouter = require('./routes/testo.routes');
const ccpRouter = require('./routes/ccp.routes');
const rationalOvenRouter = require('./routes/rationalOven.routes');
const notificationsRouter = require('./routes/notifications.routes');
const businessDetailsRouter = require('./routes/businessDetails.routes');
const usersRouter = require('./routes/users.routes'); //ADMIN PAGE
// ✅ NEW: Diary Router
const diaryRouter = require('./routes/diary.routes');

// ✅ API Routes
app.use('/api/oven', ovenRouter);
app.use('/api/auth', authRouter);
app.use('/api/testo', testoRouter);
app.use('/api/ccp', ccpRouter);
app.use('/api/rational-oven', rationalOvenRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/business-details', businessDetailsRouter);
app.use('/api/diary', diaryRouter); // ⭐ YOUR PART
app.use('/api/users', usersRouter); //ADMIN PAGE

// ✅ Database test route
const { pool } = require('./db');
app.get('/api/db-test', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ success: true, message: 'Database connection successful' });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: err.message
    });
  }
});

// ✅ Root route
app.get('/', (req, res) => {
  res.send('Foodie Control Backend Running');
});

// ✅ Port
const PORT = process.env.PORT || 4000;

// ✅ Scheduler
function startTestoScheduler() {
  const FIVE_MINUTES = 5 * 60 * 1000;

  setInterval(async () => {
    try {
      const result = await ingestMockTestoReadings();
      console.log('Scheduled Testo ingestion:', result);
    } catch (error) {
      console.error('Scheduled Testo ingestion failed:', error.message);
    }
  }, FIVE_MINUTES);
}

// ✅ Start server
app.listen(PORT, async () => {
  await initTables();
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  try {
    await seedAdmin();
  } catch (error) {
    console.error('Admin seed warning:', error.message);
  }

  try {
    const result = await ingestMockTestoReadings();
    console.log('Initial Testo ingestion:', result);
  } catch (error) {
    console.error('Initial Testo ingestion failed:', error.message);
  }

  startTestoScheduler();
});