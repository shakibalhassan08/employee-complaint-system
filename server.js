const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Connect DB
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    return;
  }
  console.log("✅ MySQL Connected");
});

// Test route
app.get("/", (req, res) => {
  res.send("Employee Complaint System API is running 🚀");
});

// Submit complaint (client)
app.post("/complaints", (req, res) => {
  const { name, email, complaint } = req.body;

  const sql =
    "INSERT INTO complaints (name, email, complaint) VALUES (?, ?, ?)";

  db.query(sql, [name, email, complaint], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json({ message: "Complaint submitted successfully" });
  });
});

// Admin view
app.get("/complaints", (req, res) => {
  db.query("SELECT * FROM complaints ORDER BY id DESC", (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

// Render PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
