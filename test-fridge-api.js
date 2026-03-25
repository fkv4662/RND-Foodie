// Quick test script for fridge API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api/fridge';

async function testPostLog() {
  try {
    const res = await axios.post(`${BASE_URL}/log`, {
      device_name: 'Fridge 1',
      temperature: 3,
      humidity: 40
    });
    console.log('POST /log response:', res.data);
  } catch (err) {
    console.error('POST /log error:', err.response ? err.response.data : err.message);
  }
}

async function testGetLogs() {
  try {
    const res = await axios.get(`${BASE_URL}/logs`);
    console.log('GET /logs response:', res.data);
  } catch (err) {
    console.error('GET /logs error:', err.response ? err.response.data : err.message);
  }
}

async function testGetAlerts() {
  try {
    const res = await axios.get(`${BASE_URL}/alerts`);
    console.log('GET /alerts response:', res.data);
  } catch (err) {
    console.error('GET /alerts error:', err.response ? err.response.data : err.message);
  }
}

async function runTests() {
  await testPostLog();
  await testGetLogs();
  await testGetAlerts();
}

runTests();
