const express = require('express');
const router = express.Router();
const db = require('../db');

db.run(`CREATE TABLE IF NOT EXISTS Students (
    StudentID INTEGER PRIMARY KEY AUTOINCREMENT,
    FirstName TEXT NOT NULL,
    LastName TEXT NOT NULL,
    LevelName TEXT,
    DateOfBirth TEXT,
    SubscriptionType TEXT DEFAULT 'كلي',
    Phone TEXT,
    ParentPhone TEXT,
    CardUID TEXT,
    IsActive INTEGER DEFAULT 1
)`);
console.log("✅ Students table ready");

// Get all students
router.get('/', (req, res) => {
    const { search } = req.query;
    let query = `SELECT * FROM Students WHERE IsActive = 1`;
    const params = [];

    if (search) {
        query += ` AND (FirstName LIKE ? OR LastName LIKE ? OR LevelName LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add new student
router.post('/', (req, res) => {
    const { FirstName, LastName, LevelName, Phone, ParentPhone, CardUID, DateOfBirth, SubscriptionType } = req.body;

    db.run(`INSERT INTO Students 
            (FirstName, LastName, LevelName, Phone, ParentPhone, CardUID, DateOfBirth, SubscriptionType)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [FirstName, LastName, LevelName, Phone, ParentPhone, CardUID, DateOfBirth, SubscriptionType || 'كلي'],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, StudentID: this.lastID });
        }
    );
});

// Soft Delete
router.delete('/:id', (req, res) => {
    db.run(`UPDATE Students SET IsActive = 0 WHERE StudentID = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

module.exports = router;