const db = require('./db');

db.serialize(() => {
    db.run(`ALTER TABLE TeacherContracts ADD COLUMN IsPaid BOOLEAN DEFAULT 0`, () => {
        console.log("✅ IsPaid column added to TeacherContracts");
    });
});

setTimeout(() => db.close(), 1000);
