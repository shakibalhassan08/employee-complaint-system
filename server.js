const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serves client.html & admin.html

// MySQL Pool (AIVEN READY)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Test DB connection
db.getConnection((err, conn) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL Connected");
    conn.release();
  }
});

// Home check
app.get("/", (req, res) => {
  res.send("Employee Complaint System API is running 🚀");
});

// Submit complaint
app.post("/api/complaint", (req, res) => {
  const { emp_id, problem } = req.body;

  if (!emp_id || !problem) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const sql =
    "INSERT INTO complaints (emp_id, problem, status) VALUES (?, ?, 'Open')";

  db.query(sql, [emp_id, problem], (err) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "DB error" });
    }
    res.json({ message: "Complaint submitted successfully" });
  });
});

// Get complaints (Admin)
app.get("/api/complaints", (req, res) => {
  db.query("SELECT * FROM complaints ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json([]);
    }
    res.json(rows);
  });
});

// Update status
app.put("/api/complaint/:id", (req, res) => {
  const { status } = req.body;
  db.query(
    "UPDATE complaints SET status=? WHERE complaint_id=?",
    [status, req.params.id],
    () => res.json({ message: "Updated" })
  );
});

// Serve pages
app.get("/client", (req, res) =>
  res.sendFile(path.join(__dirname, "public/client.html"))
);

app.get("/admin", (req, res) =>
  res.sendFile(path.join(__dirname, "public/admin.html"))
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
