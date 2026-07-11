const db = require('./db');

db.serialize(() => {
    console.log("Updating StudentPayments table...");

    db.run(`ALTER TABLE StudentPayments ADD COLUMN Subject TEXT`, () => {});
    db.run(`ALTER TABLE StudentPayments ADD COLUMN CycleNumber INTEGER`, () => {});

    console.log("✅ StudentPayments table updated successfully!");
});

setTimeout(() => db.close(), 1000);