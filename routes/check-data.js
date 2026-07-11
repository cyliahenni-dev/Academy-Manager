const db = require('./db');

console.log('=== عقود المعلمين المدفوعة ليوليو 2026 ===');
db.all(`SELECT * FROM TeacherContracts WHERE IsPaid = 1 AND StartDate LIKE '2026-07%'`, (err, rows) => {
    console.log(rows);

    console.log('=== مصروفات أخرى ليوليو 2026 ===');
    db.all(`SELECT * FROM OtherExpenses WHERE MonthOfExpense = '2026-07'`, (err, rows2) => {
        console.log(rows2);

        console.log('=== دفعات المعلمين المسجلة ليوليو 2026 ===');
        db.all(`SELECT * FROM TeacherPayments WHERE MonthOfPayment = '2026-07'`, (err, rows3) => {
            console.log(rows3);
            process.exit();
        });
    });
});