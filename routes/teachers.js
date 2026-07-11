const express = require('express');
const router = express.Router();
const db = require('../db');

db.run(`CREATE TABLE IF NOT EXISTS Teachers (
    TeacherID INTEGER PRIMARY KEY AUTOINCREMENT,
    FirstName TEXT NOT NULL,
    LastName TEXT NOT NULL,
    Phone TEXT,
    Email TEXT,
    Subject TEXT,
    IsActive INTEGER DEFAULT 1
)`);
console.log("✅ Teachers table ready");

router.get('/', (req, res) => {
    const { search } = req.query;
    let query = `SELECT * FROM Teachers WHERE IsActive = 1`;
    const params = [];
    if (search) {
        query += ` AND (FirstName LIKE ? OR LastName LIKE ? OR Subject LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/', (req, res) => {
    const { FirstName, LastName, Phone, Email, Subject } = req.body;
    db.run(`INSERT INTO Teachers (FirstName, LastName, Phone, Email, Subject)
            VALUES (?, ?, ?, ?, ?)`,
        [FirstName, LastName, Phone, Email, Subject],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, TeacherID: this.lastID });
        }
    );
});

router.delete('/:id', (req, res) => {
    db.run(`UPDATE Teachers SET IsActive = 0 WHERE TeacherID = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

module.exports = router;