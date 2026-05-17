const express = require("express");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const router = express.Router();

const SECRET = process.env.JWT_SECRET || "super_secret_key";

function getRequestUser(req) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);

  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

function requireAuthenticatedUser(req, res, next) {
  const user = getRequestUser(req);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  req.user = user;
  next();
}

function requireManager(req, res, next) {
  const user = getRequestUser(req);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (user.role !== "MANAGER") {
    return res.status(403).json({
      success: false,
      message: "Only managers can manage schedule tasks",
    });
  }

  req.user = user;
  next();
}

function parseWeekStart(value) {
  const base = value ? new Date(`${value}T00:00:00`) : new Date();
  const currentDay = base.getDay();
  const offsetToMonday = (currentDay + 6) % 7;
  const monday = new Date(base);

  monday.setDate(base.getDate() - offsetToMonday);
  monday.setHours(0, 0, 0, 0);

  return monday;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeOccurrenceDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return formatDate(value);
  }

  return String(value).slice(0, 10);
}

function buildWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return {
      dayOfWeek: index,
      date,
      occurrenceDate: formatDate(date),
    };
  });
}

function normalizeTaskPayload(body) {
  const {
    title,
    scheduledTime,
    recurrenceType,
    dayOfWeek,
    assignedUserId,
    assignToEveryone,
  } = body;

  if (!title || !scheduledTime || !recurrenceType) {
    return { error: "Title, time, and recurrence are required" };
  }

  if (!["WEEKLY", "DAILY"].includes(recurrenceType)) {
    return { error: "Invalid recurrence type" };
  }

  const everyUser = Boolean(assignToEveryone);
  const normalizedAssignedUserId = everyUser ? null : assignedUserId || null;
  const normalizedDayOfWeek = recurrenceType === "DAILY" ? null : Number(dayOfWeek);

  if (!everyUser && !normalizedAssignedUserId) {
    return { error: "Choose an assignee or Everyone" };
  }

  if (recurrenceType === "WEEKLY" && !Number.isInteger(normalizedDayOfWeek)) {
    return { error: "Choose a day for weekly tasks" };
  }

  return {
    value: {
      title: title.trim(),
      scheduledTime,
      recurrenceType,
      dayOfWeek: normalizedDayOfWeek,
      assignedUserId: normalizedAssignedUserId,
      assignToEveryone: everyUser,
    },
  };
}

router.get("/week", requireAuthenticatedUser, async (req, res) => {
  try {
    const weekStart = parseWeekStart(req.query.weekStart);
    const weekDays = buildWeekDays(weekStart);
    const weekEnd = weekDays[6].occurrenceDate;

    const tasksResult = await pool.query(
      `
      SELECT
        t.id,
        t.title,
        t.scheduled_time,
        t.day_of_week,
        t.recurrence_type,
        t.assigned_user_id,
        t.assign_to_everyone,
        t.created_at,
        u.username AS assigned_username
      FROM schedule_tasks t
      LEFT JOIN users u ON u.id = t.assigned_user_id
      WHERE t.is_active = TRUE
      ORDER BY t.scheduled_time ASC, t.created_at ASC
      `,
      []
    );

    const completionsResult = await pool.query(
      `
      SELECT
        c.task_id,
        c.occurrence_date,
        c.completed_at,
        c.completed_by_user_id,
        cu.username AS completed_by_username
      FROM schedule_task_completions c
      LEFT JOIN users cu ON cu.id = c.completed_by_user_id
      WHERE c.occurrence_date BETWEEN $1::date AND $2::date
      `,
      [weekDays[0].occurrenceDate, weekEnd]
    );

    const completionsByKey = new Map();

    for (const row of completionsResult.rows) {
      const occurrenceDate = normalizeOccurrenceDate(row.occurrence_date);

      if (occurrenceDate) {
        completionsByKey.set(`${row.task_id}:${occurrenceDate}`, row);
      }
    }

    const schedule = weekDays.map(({ dayOfWeek, occurrenceDate }) => {
      const tasks = tasksResult.rows
        .filter((row) => row.recurrence_type === "DAILY" || row.day_of_week === dayOfWeek)
        .map((row) => {
          const completion = completionsByKey.get(`${row.id}:${occurrenceDate}`);

          return {
            id: row.id,
            title: row.title,
            scheduledTime: row.scheduled_time,
            dayOfWeek: row.day_of_week,
            recurrenceType: row.recurrence_type,
            assignedUserId: row.assigned_user_id,
            assignedLabel: row.assign_to_everyone ? "Everyone" : row.assigned_username || "Unassigned",
            assignToEveryone: row.assign_to_everyone,
            occurrenceDate,
            completed: Boolean(completion),
            completedAt: completion?.completed_at || null,
            completedBy: completion?.completed_by_username || null,
          };
        });

      return {
        dayOfWeek,
        occurrenceDate,
        tasks,
      };
    });

    const recurringTasks = tasksResult.rows
      .filter((row) => row.recurrence_type === "DAILY")
      .map((row) => ({
        id: row.id,
        title: row.title,
        scheduledTime: row.scheduled_time,
        assignedLabel: row.assign_to_everyone ? "Everyone" : row.assigned_username || "Unassigned",
        recurrenceType: row.recurrence_type,
      }));

    res.json({
      success: true,
      weekStart: weekDays[0].occurrenceDate,
      weekEnd,
      canManage: req.user.role === "MANAGER",
      schedule,
      recurringTasks,
    });
  } catch (error) {
    console.error("Fetch schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load schedule",
    });
  }
});

router.post("/tasks", requireManager, async (req, res) => {
  try {
    const normalized = normalizeTaskPayload(req.body);

    if (normalized.error) {
      return res.status(400).json({
        success: false,
        message: normalized.error,
      });
    }

    const { value } = normalized;

    const result = await pool.query(
      `
      INSERT INTO schedule_tasks (
        title,
        scheduled_time,
        day_of_week,
        recurrence_type,
        assigned_user_id,
        assign_to_everyone,
        created_by_user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [
        value.title,
        value.scheduledTime,
        value.dayOfWeek,
        value.recurrenceType,
        value.assignedUserId,
        value.assignToEveryone,
        req.user.id,
      ]
    );

    res.status(201).json({
      success: true,
      taskId: result.rows[0].id,
    });
  } catch (error) {
    console.error("Create schedule task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
});

router.put("/tasks/:id", requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const normalized = normalizeTaskPayload(req.body);

    if (normalized.error) {
      return res.status(400).json({
        success: false,
        message: normalized.error,
      });
    }

    const { value } = normalized;

    const result = await pool.query(
      `
      UPDATE schedule_tasks
      SET
        title = $1,
        scheduled_time = $2,
        day_of_week = $3,
        recurrence_type = $4,
        assigned_user_id = $5,
        assign_to_everyone = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND is_active = TRUE
      RETURNING id
      `,
      [
        value.title,
        value.scheduledTime,
        value.dayOfWeek,
        value.recurrenceType,
        value.assignedUserId,
        value.assignToEveryone,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      taskId: result.rows[0].id,
    });
  } catch (error) {
    console.error("Update schedule task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
});

router.delete("/tasks/:id", requireManager, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE schedule_tasks
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = TRUE
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete schedule task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
});

router.patch("/tasks/:id/completion", requireAuthenticatedUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { occurrenceDate, completed } = req.body;

    if (!occurrenceDate || typeof completed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Occurrence date and completed state are required",
      });
    }

    const existingTask = await pool.query(
      `
      SELECT id, assigned_user_id, assign_to_everyone
      FROM schedule_tasks
      WHERE id = $1 AND is_active = TRUE
      `,
      [id]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const task = existingTask.rows[0];
    const canToggleCompletion =
      req.user.role === "MANAGER" ||
      task.assign_to_everyone ||
      Number(task.assigned_user_id) === Number(req.user.id);

    if (!canToggleCompletion) {
      return res.status(403).json({
        success: false,
        message: "You can only mark your own tasks or Everyone tasks as done",
      });
    }

    if (completed) {
      await pool.query(
        `
        INSERT INTO schedule_task_completions (task_id, occurrence_date, completed_by_user_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (task_id, occurrence_date)
        DO UPDATE SET
          completed_by_user_id = EXCLUDED.completed_by_user_id,
          completed_at = CURRENT_TIMESTAMP
        `,
        [id, occurrenceDate, req.user.id]
      );
    } else {
      await pool.query(
        "DELETE FROM schedule_task_completions WHERE task_id = $1 AND occurrence_date = $2",
        [id, occurrenceDate]
      );
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Toggle schedule completion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task completion",
    });
  }
});

module.exports = router;