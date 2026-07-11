const express = require('express');
const router = express.Router();
const db = require('../db');
const ExcelJS = require('exceljs');

// ====================== إنشاء جداول الحضور ======================
db.run(`CREATE TABLE IF NOT EXISTS TeacherAttendance (
    AttendanceID INTEGER PRIMARY KEY AUTOINCREMENT,
    TeacherID INTEGER NOT NULL,
    Date TEXT NOT NULL,
    WorkedUnits REAL DEFAULT 1,
    Subject TEXT,
    Notes TEXT,
    FOREIGN KEY(TeacherID) REFERENCES Teachers(TeacherID)
)`);

db.run(`CREATE TABLE IF NOT EXISTS StudentAttendance (
    AttendanceID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID TEXT NOT NULL,
    Subject TEXT NOT NULL,
    Date TEXT NOT NULL,
    Cycle INTEGER DEFAULT 1
)`);

// ====================== إعدادات المواد ======================
db.run(`CREATE TABLE IF NOT EXISTS SubjectSettings (
    Subject TEXT PRIMARY KEY,
    CycleSize INTEGER DEFAULT 4
)`);

console.log("✅ Attendance & SubjectSettings tables ready");

// ====================== إعدادات المواد ======================
router.get('/subjects', (req, res) => {
    db.all(`SELECT * FROM SubjectSettings ORDER BY Subject`, (err, rows) => {
        res.json(rows || []);
    });
});

router.post('/subjects', (req, res) => {
    const { Subject, CycleSize } = req.body;
    if (!Subject || !CycleSize) return res.status(400).json({ error: 'المادة وحجم الدورة مطلوبان' });
    
    db.run(`INSERT INTO SubjectSettings (Subject, CycleSize)
            VALUES (?, ?)
            ON CONFLICT(Subject) DO UPDATE SET CycleSize = excluded.CycleSize`,
        [Subject, CycleSize],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

router.delete('/subjects/:subject', (req, res) => {
    db.run(`DELETE FROM SubjectSettings WHERE Subject = ?`, [req.params.subject], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ====================== حضور الطلاب ======================
router.post('/student', (req, res) => {
    const { StudentID, Subject, force = false } = req.body;
    const attendanceDate = req.body.Date || new Date().toISOString().split('T')[0];

    db.get(`SELECT COUNT(*) as count FROM StudentAttendance
            WHERE StudentID = ? AND Subject = ? AND Date = ?`,
        [StudentID, Subject, attendanceDate], (err, existing) => {

        if (existing && existing.count > 0 && !force) {
            return res.json({
                success: false,
                needsConfirm: true,
                message: `تم تسجيل حضور لهذا الطالب في "${Subject}" بتاريخ ${attendanceDate}. هل تريد إضافة حضور آخر؟`
            });
        }

        db.get(`SELECT CycleSize FROM SubjectSettings WHERE Subject = ?`, [Subject], (err, setting) => {
            const cycleSize = (setting && setting.CycleSize) ? setting.CycleSize : 4;

            db.get(`SELECT MAX(Cycle) as maxCycle FROM StudentAttendance WHERE StudentID = ? AND Subject = ?`,
                [StudentID, Subject], (err, cycleRow) => {

                const lastCycle = (cycleRow && cycleRow.maxCycle) ? cycleRow.maxCycle : 1;

                db.get(`SELECT COUNT(*) as countInCycle FROM StudentAttendance
                        WHERE StudentID = ? AND Subject = ? AND Cycle = ?`,
                    [StudentID, Subject, lastCycle], (err, countRow) => {

                    const countInCycle = countRow ? countRow.countInCycle : 0;
                    const newCycle = countInCycle >= cycleSize ? lastCycle + 1 : lastCycle;

                    db.run(`INSERT INTO StudentAttendance (StudentID, Subject, Date, Cycle)
                            VALUES (?, ?, ?, ?)`,
                        [StudentID, Subject, attendanceDate, newCycle],
                        (err) => {
                            if (err) return res.status(500).json({ error: err.message });
                            res.json({
                                success: true,
                                cycle: newCycle,
                                positionInCycle: countInCycle >= cycleSize ? 1 : countInCycle + 1,
                                cycleSize,
                                message: `تم التسجيل بتاريخ ${attendanceDate}`
                            });
                        }
                    );
                });
            });
        });
    });
});

// حذف حضور طالب — بالـ AttendanceID (دقيق 100%)
router.delete('/student/:id', (req, res) => {
    db.run(`DELETE FROM StudentAttendance WHERE AttendanceID = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ success: false, error: 'السجل غير موجود' });
        res.json({ success: true });
    });
});

// (الطريق القديم بالاسم/المادة — يبقى متاح لأي كود قديم، لكن غير مستحسن)
router.post('/student/delete', (req, res) => {
    const { StudentID, Subject } = req.body;
    db.run(`DELETE FROM StudentAttendance WHERE StudentID = ? AND Subject = ?`,
        [StudentID, Subject], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

router.get('/students-all', (req, res) => {
    db.all(`SELECT a.*, s.FirstName, s.LastName
            FROM StudentAttendance a
            LEFT JOIN Students s ON a.StudentID = s.StudentID
            ORDER BY s.FirstName ASC, s.LastName ASC, a.Subject ASC, a.Date DESC`, (err, rows) => {
        res.json(rows || []);
    });
});

// ====================== حضور المعلمين ======================
router.post('/teacher', (req, res) => {
    const { TeacherID, WorkedUnits = 1, Notes = '', Subject = '' } = req.body;
    const attendanceDate = req.body.Date || new Date().toISOString().split('T')[0];

    db.run(`INSERT INTO TeacherAttendance (TeacherID, Date, WorkedUnits, Notes, Subject)
            VALUES (?, ?, ?, ?, ?)`,
        [TeacherID, attendanceDate, WorkedUnits, Notes, Subject],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

// حذف حضور معلم — بالـ AttendanceID (دقيق 100%)
router.delete('/teacher/:id', (req, res) => {
    db.run(`DELETE FROM TeacherAttendance WHERE AttendanceID = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ success: false, error: 'السجل غير موجود' });
        res.json({ success: true });
    });
});

// (الطريق القديم بالاسم/المادة — يبقى متاح لأي كود قديم، لكن غير مستحسن، فيه ثغرة NULL مقابل نص فارغ)
router.post('/teacher/delete', (req, res) => {
    const { name, subject } = req.body;
    db.run(`DELETE FROM TeacherAttendance 
            WHERE TeacherID IN (SELECT TeacherID FROM Teachers WHERE FirstName || ' ' || LastName = ?)
            AND (Subject = ? OR (Subject IS NULL AND ? = '') OR (Subject = '' AND ? IS NULL))`,
        [name, subject, subject, subject], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, deletedCount: this.changes });
        });
});

router.get('/teachers-all', (req, res) => {
    db.all(`SELECT a.*, t.FirstName, t.LastName
            FROM TeacherAttendance a
            LEFT JOIN Teachers t ON a.TeacherID = t.TeacherID
            ORDER BY a.Date DESC`, (err, rows) => res.json(rows || []));
});

// ====================== تصدير Excel ======================
router.get('/export/students', (req, res) => { /* ... same as before */ });
router.get('/export/teachers', (req, res) => { /* ... same as before */ });

module.exports = router;