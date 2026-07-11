const db = require('./db');

db.serialize(() => {
    db.run(`ALTER TABLE TeacherAttendance ADD COLUMN Subject TEXT`, () => {
        console.log("✅ Subject column added to TeacherAttendance");
    });
});

setTimeout(() => db.close(), 1000);