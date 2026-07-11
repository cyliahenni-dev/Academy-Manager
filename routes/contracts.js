const express = require('express');
const router = express.Router();
const db = require('../db');
const ExcelJS = require('exceljs');


db.run(`CREATE TABLE IF NOT EXISTS TeacherContracts (
    ContractID INTEGER PRIMARY KEY AUTOINCREMENT,
    TeacherID INTEGER NOT NULL,
    Subject TEXT,
    LevelID INTEGER,
    StartDate TEXT,
    EndDate TEXT,
    PaymentMode TEXT,
    PaymentRate REAL,
    Notes TEXT,
    IsPaid INTEGER DEFAULT 0,
    IsActive INTEGER DEFAULT 1
)`);
console.log("✅ TeacherContracts table ready");


// Get contracts for teacher
router.get('/teacher/:teacherId', (req, res) => {
    db.all(`SELECT * FROM TeacherContracts WHERE TeacherID = ? AND IsActive = 1`, 
        [req.params.teacherId], (err, rows) => res.json(rows || []));
});

// Add new contract
router.post('/', (req, res) => {
    const { TeacherID, Subject, LevelID, StartDate, EndDate, PaymentMode, PaymentRate, Notes } = req.body;
    
    db.run(`INSERT INTO TeacherContracts 
            (TeacherID, Subject, LevelID, StartDate, EndDate, PaymentMode, PaymentRate, Notes, IsPaid)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [TeacherID, Subject, LevelID || null, StartDate, EndDate, PaymentMode, PaymentRate, Notes],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, ContractID: this.lastID });
        }
    );
});

// Mark as paid
router.post('/:id/pay', (req, res) => {
    db.get(`SELECT * FROM TeacherContracts WHERE ContractID = ?`, [req.params.id], (err, contract) => {
        if (err || !contract) return res.status(404).json({ error: "Contract not found" });

        // Update contract
        db.run(`UPDATE TeacherContracts SET IsPaid = 1 WHERE ContractID = ?`, [req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            const paymentMonth = contract.StartDate ? contract.StartDate.substring(0, 7) : new Date().toISOString().substring(0, 7);
            const paymentDate = contract.StartDate ? contract.StartDate.split('T')[0] : new Date().toISOString().split('T')[0];

            // Check if already recorded in payments to avoid duplication
            db.get(`SELECT COUNT(*) as count FROM TeacherPayments WHERE ContractID = ?`, [contract.ContractID], (err, row) => {
                if (row && row.count > 0) {
                    return res.json({ success: true }); // already recorded
                }

                // Insert only if not exists
                db.run(`INSERT INTO TeacherPayments 
                        (TeacherID, ContractID, Subject, PaymentMode, AmountPaid, MonthOfPayment, PaymentDate)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [contract.TeacherID, contract.ContractID, contract.Subject, contract.PaymentMode, contract.PaymentRate, paymentMonth, paymentDate],
                    function(err) {
                        if (err) console.error("Insert payment error:", err);
                        res.json({ success: true });
                    }
                );
            });
        });
    });
});

// Soft delete
router.delete('/:id', (req, res) => {
    db.run(`UPDATE TeacherContracts SET IsActive = 0 WHERE ContractID = ?`, [req.params.id], (err) => {
        res.json({ success: true });
    });
});

// Excel Export for Teacher Contracts
router.get('/export', (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('عقود_المعلمين');

    sheet.columns = [
        { header: 'المعلم', key: 'TeacherName', width: 30 },
        { header: 'المادة', key: 'Subject', width: 20 },
        { header: 'نوع الدفع', key: 'PaymentMode', width: 18 },
        { header: 'القيمة', key: 'PaymentRate', width: 15 },
        { header: 'من', key: 'StartDate', width: 15 },
        { header: 'إلى', key: 'EndDate', width: 15 },
        { header: 'حالة الدفع', key: 'IsPaid', width: 18 }
    ];

    db.all(`SELECT 
                t.FirstName || ' ' || t.LastName AS TeacherName,
                c.Subject, c.PaymentMode, c.PaymentRate, 
                c.StartDate, c.EndDate, 
                CASE WHEN c.IsPaid = 1 THEN 'مدفوع' ELSE 'غير مدفوع' END AS IsPaid
            FROM TeacherContracts c
            JOIN Teachers t ON c.TeacherID = t.TeacherID
            WHERE c.IsActive = 1 
            ORDER BY t.FirstName`, (err, rows) => {
        if (err) {
            console.error("Export error:", err);
            return res.status(500).send("Error");
        }

        sheet.addRows(rows);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=teacher_contracts.xlsx');
        workbook.xlsx.write(res).then(() => res.end());
    });
});

// Create TeacherPayments table
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

console.log("✅ TeacherPayments table ready");

module.exports = router;