const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* MySQL Connection */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL Error:", err.message);
  } else {
    console.log("✅ MySQL Connected");
  }
});

/* ROUTES */

/* Home check */
app.get("/", (req, res) => {
  res.send("Employee Complaint System API is running 🚀");
});

/* Serve pages */
app.get("/client", (req, res) => {
  res.sendFile(path.join(__dirname, "public/client.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin.html"));
});

/* APIs */

/* Create complaint */
app.post("/api/complaint", (req, res) => {
  const { emp_id, problem } = req.body;

  if (!emp_id || !problem) {
    return res.status(400).json({ message: "Missing data" });
  }

  const sql =
    "INSERT INTO complaints (emp_id, problem, status) VALUES (?, ?, 'Open')";

  db.query(sql, [emp_id, problem], err => {
    if (err) {
      return res.status(500).json({ message: "DB error" });
    }
    res.json({ message: "Complaint submitted successfully" });
  });
});

/* Get all complaints */
app.get("/api/complaints", (req, res) => {
  db.query("SELECT * FROM complaints ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
});

/* Update status */
app.put("/api/complaint/:id", (req, res) => {
  const { status } = req.body;
  db.query(
    "UPDATE complaints SET status=? WHERE complaint_id=?",
    [status, req.params.id],
    err => {
      if (err) return res.status(500).json({ message: "Update failed" });
      res.json({ message: "Updated" });
    }
  );
});

/* Start server */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
