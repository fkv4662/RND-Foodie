const fs = require('fs/promises');
const path = require('path');
const { pool } = require('../db');

function getStatusFromTemperature(temperature) {
  return Number(temperature) > 5 ? 'ALERT' : 'SAFE';
}

async function readMockTestoData() {
  const filePath = path.join(__dirname, '..', 'mock', 'testo-sample.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function ingestMockTestoReadings() {
  const readings = await readMockTestoData();

  let inserted = 0;
  let skipped = 0;

  for (const reading of readings) {
    const status = getStatusFromTemperature(reading.temperature);

    const query = `
      INSERT INTO testo_readings (
        source,
        external_id,
        device_id,
        device_name,
        location,
        temperature,
        humidity,
        status,
        recorded_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (external_id) DO NOTHING
    `;

    const values = [
      'TESTO_CLOUD',
      reading.external_id,
      reading.device_id,
      reading.device_name,
      reading.location || null,
      reading.temperature,
      reading.humidity ?? null,
      status,
      reading.recorded_at
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 1) {
      inserted++;
    } else {
      skipped++;
    }
  }

  return {
    total: readings.length,
    inserted,
    skipped
  };
}

async function addManualTestoReading(data) {
  const { device_id, device_name, location, temperature, humidity } = data;

  if (!device_id || !device_name || temperature === undefined || temperature === null) {
    throw new Error('device_id, device_name and temperature are required');
  }

  const status = getStatusFromTemperature(temperature);

  const query = `
    INSERT INTO testo_readings (
      source,
      external_id,
      device_id,
      device_name,
      location,
      temperature,
      humidity,
      status,
      recorded_at
    )
    VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING
      id,
      source,
      device_id,
      device_name,
      location,
      temperature,
      humidity,
      status,
      to_char(recorded_at, 'YYYY-MM-DD HH24:MI:SS') AS recorded_at
  `;

  const values = [
    'MANUAL_ENTRY',
    device_id,
    device_name,
    location || null,
    temperature,
    humidity ?? null,
    status
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getAllTestoReadings() {
  const query = `
    SELECT
      id,
      source,
      device_id,
      device_name,
      location,
      temperature,
      humidity,
      status,
      to_char(recorded_at, 'YYYY-MM-DD HH24:MI:SS') AS recorded_at,
      to_char(imported_at, 'YYYY-MM-DD HH24:MI:SS') AS imported_at
    FROM testo_readings
    ORDER BY recorded_at DESC, imported_at DESC, id DESC
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function getTestoAlerts() {
  const query = `
    SELECT
      id,
      source,
      device_id,
      device_name,
      location,
      temperature,
      humidity,
      status,
      to_char(recorded_at, 'YYYY-MM-DD HH24:MI:SS') AS recorded_at,
      to_char(imported_at, 'YYYY-MM-DD HH24:MI:SS') AS imported_at
    FROM testo_readings
    WHERE status = 'ALERT'
    ORDER BY recorded_at DESC, imported_at DESC, id DESC
  `;

  const result = await pool.query(query);
  return result.rows;
}

module.exports = {
  ingestMockTestoReadings,
  addManualTestoReading,
  getAllTestoReadings,
  getTestoAlerts
};