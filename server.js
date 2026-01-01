const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// MySQL Pool (AIVEN)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true }
});

// Test DB
db.getConnection((err, conn) => {
  if (err) {
    console.error("❌ MySQL Error:", err.message);
  } else {
    console.log("✅ MySQL Connected");
    conn.release();
  }
});

// Routes
app.get("/", (req, res) => {
  res.redirect("/client.html");
});

app.post("/submit", (req, res) => {
  const { emp_id, problem } = req.body;

  const sql = "INSERT INTO complaints (emp_id, problem, status) VALUES (?, ?, 'Pending')";
  db.query(sql, [emp_id, problem], (err) => {
    if (err) {
      console.error(err);
      return res.json({ success: false });
    }
    res.json({ success: true });
  });
});

app.get("/complaints", (req, res) => {
  db.query("SELECT * FROM complaints", (err, rows) => {
    if (err) return res.json([]);
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
