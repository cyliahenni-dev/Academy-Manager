const db = require('./db');

console.log("Updating Students table with new fields...");

db.serialize(() => {
    // Add new columns if they don't exist
    db.run(`ALTER TABLE Students ADD COLUMN LevelName TEXT`, (err) => {
        if (err && !err.message.includes("duplicate column")) console.log("LevelName already exists");
    });
    
    db.run(`ALTER TABLE Students ADD COLUMN DateOfBirth DATE`, (err) => {
        if (err && !err.message.includes("duplicate column")) console.log("DateOfBirth already exists");
    });
    
    db.run(`ALTER TABLE Students ADD COLUMN SubscriptionType TEXT DEFAULT 'كلي'`, (err) => {
        if (err && !err.message.includes("duplicate column")) console.log("SubscriptionType already exists");
    });

    console.log("✅ Students table updated successfully!");
    console.log("You can now use LevelName, DateOfBirth, and SubscriptionType");
});

setTimeout(() => db.close(), 1000);