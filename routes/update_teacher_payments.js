const db = require('./db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS TeacherPayments (
        PaymentID INTEGER PRIMARY KEY AUTOINCREMENT,
        TeacherID INTEGER,
        ContractID INTEGER,
        MonthOfPayment TEXT NOT NULL,
        AmountPaid REAL NOT NULL,
        Notes TEXT,
        PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error("❌ Error:", err.message);
        } else {
            console.log("✅ TeacherPayments table created successfully!");
            console.log("You can now record teacher salaries monthly.");
        }
    });
});

setTimeout(() => db.close(), 2000);