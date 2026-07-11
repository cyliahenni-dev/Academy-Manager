const db = require('./db');

db.all(`SELECT * FROM StudentPayments ORDER BY PaymentDate DESC`, (err, rows) => {
    console.log("جميع المدفوعات المسجلة:");
    console.table(rows);
    
    if (rows.length === 0) {
        console.log("❌ لا يوجد أي مدفوعات مسجلة بعد!");
    }
});