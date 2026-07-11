const db = require('./db');

// اختبر كل الطلاب وحضورهم
db.all(`
    SELECT s.StudentID, s.FirstName, s.LastName, s.CardUID,
           COUNT(a.AttendanceID) as AttendanceCount
    FROM Students s
    LEFT JOIN StudentAttendance a 
        ON a.StudentID = s.CardUID OR a.StudentID = CAST(s.StudentID AS TEXT)
    GROUP BY s.StudentID
    ORDER BY s.FirstName
`, (err, rows) => {
    if (err) return console.log('خطأ:', err.message);
    console.log('=== الطلاب وحضورهم ===');
    rows.forEach(r => console.log(
        `ID:${r.StudentID} | ${r.FirstName} ${r.LastName} | CardUID:${r.CardUID} | حضور:${r.AttendanceCount}`
    ));
    db.close();
});
