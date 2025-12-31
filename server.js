const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC FILES
   public/client.html
   public/admin.html
========================= */
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   MYSQL CONNECTION
========================= */
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL Connected");
    connection.release();
  }
});

/* =========================
   ROUTES
========================= */

// Health check
app.get("/", (req, res) => {
  res.send("Employee Complaint System API is running 🚀");
});

/* ---------- CLIENT ---------- */
// Raise a complaint
app.post("/api/complaints", (req, res) => {
  const { emp_id, problem } = req.body;

  if (!emp_id || !problem) {
    return res.status(400).json({ message: "All fields are required" });
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

/* ---------- ADMIN ---------- */
// View all complaints
app.get("/api/complaints", (req, res) => {
  const sql = "SELECT * FROM complaints ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

// Update complaint status
app.put("/api/complaints/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = "UPDATE complaints SET status=? WHERE complaint_id=?";
  db.query(sql, [status, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Status updated successfully" });
  });
});

/* =========================
   PAGE ROUTES
========================= */
app.get("/client", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "client.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

