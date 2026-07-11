const db = require('./db');

db.serialize(() => {
    console.log("🔧 Final fix for StudentPayments...");

    // Add PaymentTimestamp column
    db.run(`ALTER TABLE StudentPayments ADD COLUMN PaymentTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
        if (err) {
            if (err.message.includes("duplicate")) {
                console.log("✅ PaymentTimestamp already exists");
            } else {
                console.error("Error:", err.message);
            }
        } else {
            console.log("✅ PaymentTimestamp column added");
        }
    });

    console.log("Table structure fixed!");
});

setTimeout(() => db.close(), 2000);