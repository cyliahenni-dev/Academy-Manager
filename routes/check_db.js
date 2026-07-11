const db = require('./db');

console.log("=== CHECKING DATABASE ===");

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    console.log("Tables:", tables.map(t => t.name));
});

db.all("SELECT * FROM StudentPayments ORDER BY PaymentDate DESC LIMIT 10", (err, payments) => {
    console.log("\nStudent Payments:", payments);
});

db.all("SELECT * FROM TeacherContracts WHERE IsActive = 1", (err, contracts) => {
    console.log("\nTeacher Contracts:", contracts);
});

db.all("SELECT * FROM OtherExpenses", (err, expenses) => {
    console.log("\nOther Expenses:", expenses);
});