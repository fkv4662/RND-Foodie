// Simulated Gateway: Sends random fridge data to your API every 5 seconds
const axios = require('axios');

const API_URL = 'http://localhost:4000/api/fridge/log';
const DEVICE_NAME = 'Simulated Fridge 1';

function getRandomTemperature() {
  // Simulate normal fridge temps, sometimes above safe
  return +(Math.random() * 6).toFixed(1); // 0.0 to 6.0
}

function getRandomHumidity() {
  return +(30 + Math.random() * 30).toFixed(1); // 30 to 60
}

async function sendReading() {
  const data = {
    device_name: DEVICE_NAME,
    temperature: getRandomTemperature(),
    humidity: getRandomHumidity()
  };
  try {
    const res = await axios.post(API_URL, data);
    console.log('Sent:', data, '| Response:', res.data.success ? 'OK' : res.data);
  } catch (err) {
    console.error('Error sending data:', err.response ? err.response.data : err.message);
  }
}

setInterval(sendReading, 5000);
console.log('Simulated gateway started. Sending data every 5 seconds...');
