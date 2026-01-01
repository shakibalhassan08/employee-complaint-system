const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const cors = require("cors");


const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- STATIC FILES ---------- */
app.use(express.static("public"));

/* ---------- MYSQL CONNECTION (AIVEN) ---------- */
const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
  ssl: process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: false } : false
});

db.getConnection((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL connected successfully");
  }
});

/* ---------- CREATE TABLE ---------- */
db.query(`
CREATE TABLE IF NOT EXISTS complaints (
  complaint_id INT AUTO_INCREMENT PRIMARY KEY,
  emp_id VARCHAR(50),
  problem TEXT,
  status VARCHAR(30) DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

/* ---------- ROUTES ---------- */

// client submit complaint
app.post("/api/complaint", (req, res) => {
  const { emp_id, problem } = req.body;
  if (!emp_id || !problem) {
    return res.status(400).json({ message: "Missing fields" });
  }

  db.query(
    "INSERT INTO complaints (emp_id, problem) VALUES (?, ?)",
    [emp_id, problem],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Complaint submitted" });
    }
  );
});

// admin fetch complaints
app.get("/api/complaints", (req, res) => {
  db.query(
    "SELECT * FROM complaints ORDER BY created_at DESC",
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// admin update status
app.put("/api/complaint/:id", (req, res) => {
  const { status } = req.body;
  db.query(
    "UPDATE complaints SET status=? WHERE complaint_id=?",
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Status updated" });
    }
  );
});

/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


