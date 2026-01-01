const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Serve static files (HTML, CSS)
app.use(express.static(path.join(__dirname, "public")));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "client.html"));
});

// ✅ MYSQL CONNECTION
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

// ✅ TEST DB
db.getConnection((err) => {
  if (err) console.error("❌ DB Error:", err.message);
  else console.log("✅ MySQL Connected");
});

// ✅ ROUTES
app.post("/api/complaint", (req, res) => {
  const { emp_id, problem } = req.body;
  if (!emp_id || !problem)
    return res.status(400).json({ message: "Missing fields" });

  db.query(
    "INSERT INTO complaints (emp_id, problem, status) VALUES (?, ?, 'Open')",
    [emp_id, problem],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Complaint submitted successfully" });
    }
  );
});

app.get("/api/complaints", (req, res) => {
  db.query("SELECT * FROM complaints ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.put("/api/complaint/:id", (req, res) => {
  db.query(
    "UPDATE complaints SET status=? WHERE complaint_id=?",
    [req.body.status, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Status updated" });
    }
  );
});

// ✅ DEFAULT
app.get("/", (req, res) => {
  res.send("Employee Complaint System API is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));


