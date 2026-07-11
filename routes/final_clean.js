const db = require('./db');

db.serialize(() => {
    console.log("🧹 Final cleanup...");

    db.run(`DELETE FROM TeacherPayments`, () => {
        console.log("✅ All TeacherPayments deleted");
    });

    db.all("SELECT * FROM TeacherPayments", (err, rows) => {
        console.log("Current TeacherPayments count:", rows ? rows.length : 0);
    });
});

setTimeout(() => db.close(), 1500);