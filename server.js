const express = require("express");
const fs = require("fs");
const readline = require("readline");
const path = require("path");

const app = express();
const PORT = 3000;
const filePath = path.join(__dirname, "students_timetable.ndjson");

// Array to store parsed student objects in memory
let students = [];

// Helper function to read and parse the NDJSON file line-by-line
function loadDatabase() {
  students = []; // Clear array

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  rl.on("line", (line) => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      try {
        students.push(JSON.parse(trimmedLine));
      } catch (err) {
        console.error("Error parsing line:", trimmedLine, err.message);
      }
    }
  });

  rl.on("close", () => {
    console.log(
      `Database fully loaded. Cached ${students.length} student records.`,
    );
  });
}

// Load the NDJSON records right when the server spins up
loadDatabase();

// Route to fetch a student by roll number
app.get("/:rollno", (req, res) => {
  const rollNo = req.params.rollno.trim().toUpperCase();
  const student = students.find(
    (s) => s.student_id.trim().toUpperCase() === rollNo,
  );

  if (!student) {
    return res
      .status(404)
      .json({ error: `Student with Roll No '${rollNo}' not found.` });
  }

  res.json(student);
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
