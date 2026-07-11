const db = require('./db');

db.serialize(() => {
    console.log("🧹 Cleaning old financial data...");

    db.run(`DELETE FROM TeacherPayments`, () => console.log("✅ TeacherPayments cleared"));
    db.run(`DELETE FROM StudentPayments`, () => console.log("✅ StudentPayments cleared"));
    db.run(`DELETE FROM OtherExpenses`, () => console.log("✅ OtherExpenses cleared"));

    console.log("All financial data cleared. Add new test data now.");
});

setTimeout(() => db.close(), 1500);