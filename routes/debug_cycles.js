const db = require('./db');

// اختبر الطالب ID:11 الذي CardUID:987
const studentId = 11;

console.log('=== اختبار دالة cycles ===');

db.get(`SELECT StudentID, CardUID FROM Students WHERE StudentID = ?`,
    [studentId], (err, student) => {
    console.log('بيانات الطالب:', student);

    const ids = [String(studentId)];
    if (student && student.CardUID) ids.push(String(student.CardUID));
    console.log('IDs للبحث:', ids);

    const ph = ids.map(() => '?').join(',');

    db.all(`
        SELECT a.Subject, a.Cycle, COUNT(a.AttendanceID) AS AttendanceCount
        FROM StudentAttendance a
        WHERE a.StudentID IN (${ph})
        GROUP BY a.Subject, a.Cycle
        ORDER BY a.Subject, a.Cycle
    `, [...ids], (err, rows) => {
        if (err) return console.log('خطأ:', err.message);
        console.log('الدورات الموجودة:', rows);
        db.close();
    });
});