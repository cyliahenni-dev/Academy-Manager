const db = require('./db');

console.log("جاري تنظيف البيانات...");

db.serialize(() => {
    db.run(`DELETE FROM TeacherContracts WHERE IsActive = 0`, (err) => {
        if (err) console.error("Error deleting contracts:", err.message);
        else console.log("✅ تم حذف العقود المحذوفة");
    });

    db.run(`DELETE FROM TeacherPayments`, (err) => {
        if (err) console.error("Error clearing payments:", err.message);
        else console.log("✅ تم تنظيف TeacherPayments");
    });

    db.run(`VACUUM`, () => {
        console.log("✅ تم ضغط قاعدة البيانات");
        console.log("✅ التنظيف انتهى بنجاح! يمكنك إغلاق هذه النافذة.");
        process.exit(0);
    });
});