const db = require('./db');

db.serialize(() => {
    console.log("🔧 Fixing StudentPayments table...");

    // Add missing columns if they don't exist
    db.run(`ALTER TABLE StudentPayments ADD COLUMN PaymentDate TEXT`, (err) => {
        if (err && !err.message.includes("duplicate")) console.log("PaymentDate already exists");
    });

    db.run(`ALTER TABLE StudentPayments ADD COLUMN PaymentTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
        if (err && !err.message.includes("duplicate")) console.log("PaymentTimestamp already exists");
    });

    console.log("✅ Table fixed!");
});

setTimeout(() => db.close(), 1500);