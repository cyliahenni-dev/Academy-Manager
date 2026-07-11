const db = require('./db');

db.run(`INSERT INTO TeacherPayments (TeacherID, MonthOfPayment, AmountPaid, Notes) 
        VALUES (1, '2026-05', 45000, 'Test Salary June')`, (err) => {
    if (err) console.error(err.message);
    else console.log("✅ New teacher salary added for 2026-05");
    db.close();
});