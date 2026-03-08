const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const ccpRoutes = require('./routes/ccp');
app.use('/api/ccp', ccpRoutes);

app.listen(5000, () => {
  console.log('Backend server running on http://localhost:5000');
});