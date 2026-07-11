const db = require('./db');

db.run(`CREATE TABLE IF NOT EXISTS OtherExpenses (
    ExpenseID INTEGER PRIMARY KEY AUTOINCREMENT,
    MonthOfExpense TEXT NOT NULL,
    Category TEXT NOT NULL,
    Description TEXT,
    Amount DECIMAL(10,2) NOT NULL,
    ExpenseDate DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

console.log("✅ OtherExpenses table created successfully!");