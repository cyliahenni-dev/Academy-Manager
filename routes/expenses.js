const express = require('express');
const router = express.Router();
const db = require('../db');
const ExcelJS = require('exceljs');

// Create table (no default timestamp)
db.run(`CREATE TABLE IF NOT EXISTS OtherExpenses (
    ExpenseID INTEGER PRIMARY KEY AUTOINCREMENT,
    MonthOfExpense TEXT,
    Category TEXT,
    Description TEXT,
    Amount REAL NOT NULL,
    ExpenseDate TEXT
)`);

console.log("✅ OtherExpenses table ready");

// Add expense
router.post('/', (req, res) => {
    const { MonthOfExpense, Category, Description, Amount, ExpenseDate } = req.body;
    
    console.log("Received expense data:", req.body);

    if (!Amount) {
        return res.status(400).json({ error: "المبلغ مطلوب" });
    }

    db.run(`INSERT INTO OtherExpenses (MonthOfExpense, Category, Description, Amount, ExpenseDate) 
            VALUES (?, ?, ?, ?, ?)`,
        [MonthOfExpense, Category, Description, Amount, ExpenseDate],
        function(err) {
            if (err) {
                console.error("Insert error:", err);
                return res.status(500).json({ error: err.message });
            }
            console.log("Expense added with ID:", this.lastID);
            res.json({ success: true });
        }
    );
});

// Get expenses
router.get('/', (req, res) => {
    const month = req.query.month;
    let query = `SELECT * FROM OtherExpenses`;
    const params = [];

    if (month) {
        query += ` WHERE MonthOfExpense = ?`;
        params.push(month);
    }

    query += ` ORDER BY ExpenseID DESC`;  // Use safe column

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error("Get error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Delete
router.delete('/:id', (req, res) => {
    db.run(`DELETE FROM OtherExpenses WHERE ExpenseID = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Excel Export
router.get('/export', (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('المصروفات');

    sheet.columns = [
        { header: 'التاريخ', key: 'ExpenseDate' },
        { header: 'الفئة', key: 'Category' },
        { header: 'المبلغ', key: 'Amount' }
    ];

    db.all(`SELECT ExpenseDate, Category, Amount FROM OtherExpenses ORDER BY ExpenseID DESC`, (err, rows) => {
        if (err) {
            console.error("Export error:", err);
            return res.status(500).send("Error");
        }

        sheet.addRows(rows.map(r => ({
            ExpenseDate: r.ExpenseDate || '',
            Category: r.Category || '',
            Amount: r.Amount || 0
        })));

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=expenses.xlsx');
        workbook.xlsx.write(res).then(() => res.end());
    });
});

module.exports = router;