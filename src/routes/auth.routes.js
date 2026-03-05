const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET = process.env.JWT_SECRET || 'super_secret_key';
const { pool } = require('../db');

// Registration route
router.post('/register', async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ success: false, message: 'Username and password required' });
	}
	try {
		// Check if user exists
		const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
		if (userCheck.rows.length > 0) {
			return res.status(409).json({ success: false, message: 'Username already exists' });
		}
		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);
		await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
		return res.json({ success: true, message: 'Registration successful' });
	} catch (err) {
		return res.status(500).json({ success: false, message: 'Server error' });
	}
});

// Login route
router.post('/login', async (req, res) => {
	const { username, password } = req.body;
	try {
		const userRes = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
		if (userRes.rows.length === 0) {
			return res.status(401).json({ success: false, message: 'Invalid credentials' });
		}
		const user = userRes.rows[0];
		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			return res.status(401).json({ success: false, message: 'Invalid credentials' });
		}
		const token = jwt.sign({ username: user.username, id: user.id }, SECRET, { expiresIn: '1h' });
		return res.json({ success: true, token, message: 'Login successful' });
	} catch (err) {
		return res.status(500).json({ success: false, message: 'Server error' });
	}
});

module.exports = router;
