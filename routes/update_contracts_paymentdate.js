const db = require('./db');

db.serialize(() => {
    console.log("🔄 Updating TeacherContracts table...");

    // Add PaymentDate column if it doesn't exist
    db.run(`ALTER TABLE TeacherContracts ADD COLUMN PaymentDate TEXT`, (err) => {
        if (err && !err.message.includes("duplicate column")) {
            console.error("❌ Error adding PaymentDate:", err.message);
        } else {
            console.log("✅ PaymentDate column added (or already exists)");
        }
    });

    // Add MonthOfPayment column (important for reports)
    db.run(`ALTER TABLE TeacherContracts ADD COLUMN MonthOfPayment TEXT`, (err) => {
        if (err && !err.message.includes("duplicate column")) {
            console.error("❌ Error adding MonthOfPayment:", err.message);
        } else {
            console.log("✅ MonthOfPayment column added (or already exists)");
        }
    });

    // Optional: Add IsPaid if not exists
    db.run(`ALTER TABLE TeacherContracts ADD COLUMN IsPaid INTEGER DEFAULT 0`, (err) => {
        if (err && !err.message.includes("duplicate column")) {
            console.error("❌ Error adding IsPaid:", err.message);
        } else {
            console.log("✅ IsPaid column ready");
        }
    });

    console.log("🎉 TeacherContracts update completed!");
});

setTimeout(() => db.close(), 2000);