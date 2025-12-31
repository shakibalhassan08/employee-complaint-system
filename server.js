const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

/* =====================
   MIDDLEWARE
===================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================
   DATABASE CONNECTION
===================== */
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false
  }
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ MySQL connected");
    connection.release();
  }
});

/* =====================
   ROUTES
===================== */

/* Test route */
app.get("/", (req, res) => {
  res.send("Employee Complaint System API is running 🚀");
});

/* CLIENT: Raise complaint */
app.post("/api/complaints", (req, res) => {
  const { emp_id, problem } = req.body;

  if (!emp_id || !problem) {
    return res.status(400).json({ message: "emp_id and problem are required" });
  }

  const sql =
    "INSERT INTO complaints (emp_id, problem, status) VALUES (?, ?, 'Pending')";

  db.query(sql, [emp_id, problem], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Complaint submitted successfully" });
  });
});

/* ADMIN: Get all complaints */
app.get("/api/admin/complaints", (req, res) => {
  const sql = "SELECT * FROM complaints ORDER BY created_at DESC";

  db.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(rows);
  });
});

/* ADMIN: Update complaint status */
app.put("/api/admin/complaints/:id", (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const sql = "UPDATE complaints SET status=? WHERE complaint_id=?";

  db.query(sql, [status, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Status updated successfully" });
  });
});

/* =====================
   START SERVER
===================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

