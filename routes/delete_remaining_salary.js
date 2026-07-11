const db = require('./db');

db.run(`DELETE FROM TeacherPayments WHERE PaymentID = 3`, (err) => {
    if (err) {
        console.error("Error:", err.message);
    } else {
        console.log("✅ Remaining 45,000 salary record deleted successfully!");
    }
    db.close();
});