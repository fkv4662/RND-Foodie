const fs = require('fs/promises');
const path = require('path');
const { pool } = require('../db');

/**
 * Temporary food-safety rule for fridge monitoring.
 * SAFE = 5°C or below
 * ALERT = above 5°C
 */
function getStatusFromTemperature(temperature) {
  return Number(temperature) > 5 ? 'ALERT' : 'SAFE';
}

/**
 * Converts a device/site name into a safe ID.
 * Example: "Test Fridge 1" becomes "testo-test-fridge-1".
 */
function makeSafeDeviceId(deviceName) {
  return `testo-${String(deviceName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`;
}

/**
 * Trims and safely converts empty/undefined CSV cells.
 */
function cleanCell(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

/**
 * Parses one semicolon-separated CSV line.
 * Testo CSV exports use semicolons instead of commas.
 */
function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ';' && !insideQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells.map(cleanCell);
}

/**
 * Converts CSV number text into a JavaScript number.
 * Supports comma decimal format too, e.g. "4,5".
 */
function parseNumber(value) {
  const cleaned = cleanCell(value).replace(',', '.');

  if (cleaned === '') {
    return null;
  }

  const number = Number(cleaned);

  if (Number.isNaN(number)) {
    return null;
  }

  return number;
}

/**
 * Converts a Testo CSV column header into a clean device name.
 * Example:
 * "Test Fridge 1: Temperature (°C)" becomes "Test Fridge 1".
 */
function getSensorNameFromHeader(header) {
  return String(header)
    .replace(/\s*:\s*Temperature\s*\(.*?\)\s*$/i, '')
    .trim();
}

/**
 * Converts frontend date/time filter values into PostgreSQL-friendly timestamps.
 * Accepts:
 * - YYYY-MM-DD
 * - YYYY-MM-DDTHH:mm
 * - YYYY-MM-DDTHH:mm:ss
 */
function normalizeDateTimeFilter(value, isEndDate = false) {
  const cleaned = cleanCell(value);

  if (!cleaned) {
    return null;
  }

  // If only a date is provided, fill in the start/end of that day.
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return isEndDate ? `${cleaned} 23:59:59` : `${cleaned} 00:00:00`;
  }

  // Convert browser datetime-local value into PostgreSQL timestamp format.
  const withSpace = cleaned.replace('T', ' ');

  // If seconds are missing, add them.
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(withSpace)) {
    return `${withSpace}:00`;
  }

  return withSpace;
}

/**
 * Adds optional date filters to a readings query.
 */
function buildDateFilterWhereClause(filters = {}) {
  const conditions = [];
  const values = [];

  const start = normalizeDateTimeFilter(filters.start, false);
  const end = normalizeDateTimeFilter(filters.end, true);

  if (start) {
    values.push(start);
    conditions.push(`recorded_at >= $${values.length}::timestamp`);
  }

  if (end) {
    values.push(end);
    conditions.push(`recorded_at <= $${values.length}::timestamp`);
  }

  return {
    whereSql: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
}

/**
 * Reads sample/mock Testo data.
 * This is kept for demo/development testing only.
 */
async function readMockTestoData() {
  const filePath = path.join(__dirname, '..', 'mock', 'testo-sample.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Imports mock Testo readings from the sample JSON file.
 * This is not the main real integration anymore, but it is useful for testing.
 */
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
      reading.recorded_at,
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
    skipped,
  };
}

/**
 * Parses a real Testo CSV export.
 * Supports multiple sensors in one CSV file.
 */
function parseTestoCsvText(csvText) {
  if (!csvText || typeof csvText !== 'string') {
    throw new Error('CSV text is required');
  }

  const normalizedText = csvText.replace(/^\uFEFF/, '');

  const lines = normalizedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV file does not contain enough rows');
  }

  const headers = parseCsvLine(lines[0]);

  if (headers.length < 2) {
    throw new Error('CSV file must contain a timestamp column and at least one sensor column');
  }

  // First column is the timestamp. Every other column is treated as a sensor measurement.
  const sensorColumns = headers.slice(1).map((header, index) => {
    const deviceName = getSensorNameFromHeader(header);

    return {
      columnIndex: index + 1,
      originalHeader: header,
      deviceName,
      deviceId: makeSafeDeviceId(deviceName),
    };
  });

  const readings = [];
  let rowsProcessed = 0;

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);

    if (cells.length === 0) {
      continue;
    }

    const recordedAt = cleanCell(cells[0]);

    if (!recordedAt) {
      continue;
    }

    rowsProcessed++;

    for (const sensor of sensorColumns) {
      const temperature = parseNumber(cells[sensor.columnIndex]);

      if (temperature === null) {
        continue;
      }

      // external_id prevents duplicate imports.
      const externalId = `TESTO_CSV|${sensor.deviceId}|${recordedAt}`;

      readings.push({
        source: 'TESTO_CSV',
        external_id: externalId,
        device_id: sensor.deviceId,
        device_name: sensor.deviceName,
        location: sensor.deviceName,
        temperature,
        humidity: null,
        status: getStatusFromTemperature(temperature),
        recorded_at: recordedAt,
      });
    }
  }

  return {
    timezoneHeader: headers[0],
    sensors: sensorColumns,
    rowsProcessed,
    readings,
  };
}

/**
 * Imports real Testo CSV data into PostgreSQL.
 * Duplicate rows are skipped using external_id.
 */
async function importTestoCsvText(csvText, fileName = 'testo-export.csv') {
  const parsed = parseTestoCsvText(csvText);

  let inserted = 0;
  let skipped = 0;

  for (const reading of parsed.readings) {
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
      reading.source,
      reading.external_id,
      reading.device_id,
      reading.device_name,
      reading.location,
      reading.temperature,
      reading.humidity,
      reading.status,
      reading.recorded_at,
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 1) {
      inserted++;
    } else {
      skipped++;
    }
  }

  return {
    fileName,
    timezoneHeader: parsed.timezoneHeader,
    sensors: parsed.sensors.map((sensor) => ({
      device_id: sensor.deviceId,
      device_name: sensor.deviceName,
      column: sensor.originalHeader,
    })),
    rowsProcessed: parsed.rowsProcessed,
    readingsFound: parsed.readings.length,
    inserted,
    skipped,
  };
}

/**
 * Saves a manual fridge reading.
 */
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
    status,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Gets all Testo readings.
 * Optional filters:
 * - start
 * - end
 */
async function getAllTestoReadings(filters = {}) {
  const { whereSql, values } = buildDateFilterWhereClause(filters);

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
    ${whereSql}
    ORDER BY recorded_at DESC, imported_at DESC, id DESC
  `;

  const result = await pool.query(query, values);
  return result.rows;
}

/**
 * Gets only Testo alert readings.
 * Optional filters:
 * - start
 * - end
 */
async function getTestoAlerts(filters = {}) {
  const { whereSql, values } = buildDateFilterWhereClause(filters);

  let query = `
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
  `;

  if (whereSql) {
    query += `
      ${whereSql}
      AND status = 'ALERT'
    `;
  } else {
    query += `
      WHERE status = 'ALERT'
    `;
  }

  query += `
    ORDER BY recorded_at DESC, imported_at DESC, id DESC
  `;

  const result = await pool.query(query, values);
  return result.rows;
}

/**
 * Gets the list of devices currently stored in testo_readings.
 * This powers the frontend device filter.
 * It automatically includes new devices after manual entry or CSV import.
 */
async function getTestoDevices() {
  const query = `
    SELECT
      device_id,
      COALESCE(MAX(device_name), device_id) AS device_name,
      COUNT(*) AS reading_count,
      to_char(MAX(recorded_at), 'YYYY-MM-DD HH24:MI:SS') AS latest_recorded_at
    FROM testo_readings
    GROUP BY device_id
    ORDER BY COALESCE(MAX(device_name), device_id) ASC
  `;

  const result = await pool.query(query);
  return result.rows;
}

module.exports = {
  ingestMockTestoReadings,
  importTestoCsvText,
  addManualTestoReading,
  getAllTestoReadings,
  getTestoAlerts,
  getTestoDevices,
};