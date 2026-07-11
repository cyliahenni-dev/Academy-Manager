const db = require('./db');

db.serialize(() => {
    console.log("🧹 Full cleanup started...");

    db.run(`DELETE FROM TeacherPayments`, () => { console.log("✅ TeacherPayments cleared"); });
    db.run(`DELETE FROM StudentPayments`, () => { console.log("✅ StudentPayments cleared"); });
    db.run(`DELETE FROM OtherExpenses`, () => { console.log("✅ OtherExpenses cleared"); });

    console.log("🎉 All financial data cleared successfully.");
});

setTimeout(() => db.close(), 1500);