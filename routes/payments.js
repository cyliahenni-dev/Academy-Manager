const express = require('express');
const router = express.Router();
const db = require('../db');

db.run(`CREATE TABLE IF NOT EXISTS StudentPayments (
    PaymentID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    Subject TEXT,
    CycleNumber INTEGER,
    AmountPaid REAL NOT NULL,
    MonthOfPayment TEXT,
    PaymentDate TEXT,
    Notes TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS TeacherPayments (
    PaymentID INTEGER PRIMARY KEY AUTOINCREMENT,
    TeacherID INTEGER NOT NULL,
    ContractID INTEGER,
    Subject TEXT,
    PaymentMode TEXT,
    AmountPaid REAL NOT NULL,
    MonthOfPayment TEXT,
    PaymentDate TEXT,
    Notes TEXT
)`);
console.log("✅ StudentPayments & TeacherPayments tables ready");

router.get('/', (req, res) => {
    const { name } = req.query;
    let query = `
        SELECT p.*, s.FirstName || ' ' || s.LastName AS StudentName,
               strftime('%d/%m/%Y', s.DateOfBirth) AS BirthDate
        FROM StudentPayments p
        LEFT JOIN Students s ON p.StudentID = s.StudentID
        WHERE 1=1
    `;
    const params = [];
    if (name) {
        query += ` AND (s.FirstName LIKE ? OR s.LastName LIKE ? OR (s.FirstName || ' ' || s.LastName) LIKE ?)`;
        params.push(`%${name}%`, `%${name}%`, `%${name}%`);
    }
    query += ` ORDER BY p.PaymentID DESC`;
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/', (req, res) => {
    const { StudentID, Subject, CycleNumber, AmountPaid, PaymentDate, Notes } = req.body;
    db.run(`INSERT INTO StudentPayments 
            (StudentID, Subject, CycleNumber, AmountPaid, PaymentDate, Notes)
            VALUES (?, ?, ?, ?, ?, ?)`,
        [StudentID, Subject || '', CycleNumber || 1, AmountPaid, PaymentDate || null, Notes || ''],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, PaymentID: this.lastID });
        }
    );
});

router.delete('/:id', (req, res) => {
    db.run(`DELETE FROM StudentPayments WHERE PaymentID = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ===== Teacher Payments =====
router.post('/teacher', (req, res) => {
    const { TeacherID, MonthOfPayment, AmountPaid, Notes } = req.body;
    if (!TeacherID || !MonthOfPayment || !AmountPaid) {
        return res.status(400).json({ error: 'بيانات ناقصة' });
    }
    const paymentDate = new Date().toISOString().split('T')[0];
    db.run(`INSERT INTO TeacherPayments (TeacherID, Subject, PaymentMode, AmountPaid, MonthOfPayment, PaymentDate, Notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [TeacherID, '', '', AmountPaid, MonthOfPayment, paymentDate, Notes || ''],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, PaymentID: this.lastID });
        }
    );
});

router.get('/teacher', (req, res) => {
    db.all(`SELECT p.*, t.FirstName, t.LastName
            FROM TeacherPayments p
            LEFT JOIN Teachers t ON p.TeacherID = t.TeacherID
            ORDER BY p.PaymentID DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

module.exports = router;