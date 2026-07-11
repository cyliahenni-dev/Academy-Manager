const db = require('./db');

db.serialize(() => {
    // Teacher Attendance
    db.run(`CREATE TABLE IF NOT EXISTS TeacherAttendance (
        AttendanceID INTEGER PRIMARY KEY AUTOINCREMENT,
        TeacherID INTEGER,
        Date TEXT,
        WorkedUnits REAL DEFAULT 1,
        Notes TEXT
    )`);

    // Student Attendance
    db.run(`CREATE TABLE IF NOT EXISTS StudentAttendance (
        AttendanceID INTEGER PRIMARY KEY AUTOINCREMENT,
        StudentID TEXT,
        Subject TEXT,
        Date TEXT,
        Cycle INTEGER DEFAULT 1
    )`);

    console.log("✅ Attendance tables are ready");
});

setTimeout(() => db.close(), 1500);