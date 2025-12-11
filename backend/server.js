const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { body, validationResult } = require("express-validator");

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "taskdb",
  password: "shruti",
  port: 5432,
});

// Validation rules
const taskValidators = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").optional().isString(),
  body("due_date").optional().isISO8601(),
  body("status")
    .optional()
    .isIn(["pending", "in-progress", "done"])
    .withMessage("Invalid status"),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// CREATE Task
app.post("/tasks", taskValidators, validate, async (req, res) => {
  try {
    const { title, description, due_date, status } = req.body;
    const q = `INSERT INTO tasks (title, description, due_date, status)
               VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [title, description || null, due_date || null, status || "pending"];
    const result = await pool.query(q, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET All Tasks
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET Task by ID
app.get("/tasks/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks WHERE id=$1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE Task
app.put("/tasks/:id", taskValidators, validate, async (req, res) => {
  try {
    const { title, description, due_date, status } = req.body;
    const q = `UPDATE tasks
               SET title=$1, description=$2, due_date=$3, status=$4
               WHERE id=$5 RETURNING *`;
    const values = [title, description || null, due_date || null, status, req.params.id];

    const result = await pool.query(q, values);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE Task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM tasks WHERE id=$1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(4000, () => console.log("Server running on port 4000"));
