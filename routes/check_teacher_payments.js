const db = require('./db');
db.all("SELECT * FROM TeacherPayments", (err, rows) => {
    console.log("TeacherPayments records:", rows.length);
    console.log(rows);
    db.close();
});