// Create a quick check file: check_reports.js
const db = require('./db');
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    console.log("Tables:", tables.map(t => t.name));
});