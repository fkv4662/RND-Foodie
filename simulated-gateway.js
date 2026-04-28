// Simulated Gateway: Sends random oven data to your API every 5 seconds
const axios = require('axios');

const API_URL = 'http://localhost:4000/api/rational-oven/log';
const DEVICE_NAME = 'Simulated Oven 1';
const FOOD_ITEMS = ['Chicken', 'Rice', 'Beef', 'Fish', 'Vegetables'];


function getRandomTemperature() {
  // Simulate oven cooking temps: 60–90°C
  return +(60 + Math.random() * 30).toFixed(1); // 60.0 to 90.0
}

function getRandomFinishTemperature(start) {
  // Simulate finishing temp: always >= start, up to 10°C higher
  return +(start + Math.random() * 10).toFixed(1);
}

function getRandomFoodItem() {
  return FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)];
}

async function sendReading() {
  const starting_temperature = getRandomTemperature();
  const finishing_temperature = getRandomFinishTemperature(starting_temperature);
  const data = {
    device_name: DEVICE_NAME,
    food_item: getRandomFoodItem(),
    starting_temperature,
    finishing_temperature
  };
  try {
    const res = await axios.post(API_URL, data);
    console.log('Sent:', data, '| Response:', res.data.success ? 'OK' : res.data);
  } catch (err) {
    console.error('Error sending data:', err.response ? err.response.data : err.message);
  }
}

setInterval(sendReading, 5000);
console.log('Simulated oven gateway started. Sending data every 5 seconds...');
