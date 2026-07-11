const db = require('./db');

db.run(`DELETE FROM OtherExpenses`, (err) => {
    if (err) console.error(err);
    else console.log("✅ Old expenses cleaned");
    db.close();
});