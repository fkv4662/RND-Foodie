const express = require('express');
const router = express.Router();


const jwt = require('jsonwebtoken');
const USER = { username: 'admin', password: 'password' };
const SECRET = process.env.JWT_SECRET || 'super_secret_key';

router.post('/login', (req, res) => {
	const { username, password } = req.body;
	if (username === USER.username && password === USER.password) {
		const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
		return res.json({ success: true, token, message: 'Login successful' });
	}
	return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

module.exports = router;
