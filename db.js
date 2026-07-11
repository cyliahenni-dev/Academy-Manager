const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.ACADEMY_DB_PATH || path.join(__dirname, 'academy.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database:', dbPath);
  }
});

module.exports = db;