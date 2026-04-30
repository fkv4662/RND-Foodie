const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const bcrypt = require("bcryptjs");

// GET users
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role FROM users ORDER BY role DESC"
    );

    res.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

// ADD user
router.post("/", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, role
      `,
      [username, email, hashedPassword, role]
    );

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Could not create user",
    });
  }
});

// EDIT user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, password } = req.body;

    if (!username || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let result;

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);

      result = await pool.query(
        `
        UPDATE users
        SET username = $1, email = $2, role = $3, password_hash = $4
        WHERE id = $5
        RETURNING id, username, email, role
        `,
        [username, email, role, hashedPassword, id]
      );
    } else {
      result = await pool.query(
        `
        UPDATE users
        SET username = $1, email = $2, role = $3
        WHERE id = $4
        RETURNING id, username, email, role
        `,
        [username, email, role, id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Could not update user",
    });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Could not delete user",
    });
  }
});

module.exports = router;