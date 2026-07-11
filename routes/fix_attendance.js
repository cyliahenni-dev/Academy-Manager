const db = require('./db');

// أولاً: اعرض الأعمدة الحقيقية للجدول
db.all(`PRAGMA table_info(StudentAttendance)`, (err, cols) => {
    if (err) return console.log('خطأ:', err.message);
    
    console.log('الأعمدة الموجودة:');
    cols.forEach(c => console.log(` - ${c.name} (${c.type})`));

    const colNames = cols.map(c => c.name).join(', ');

    // بناء تعريف الجدول الجديد بدون UNIQUE constraint
    const colDefs = cols.map(c => {
        if (c.pk === 1) return `${c.name} INTEGER PRIMARY KEY AUTOINCREMENT`;
        let def = `${c.name} ${c.type || 'TEXT'}`;
        if (c.dflt_value !== null) def += ` DEFAULT ${c.dflt_value}`;
        return def;
    }).join(',\n        ');

    db.serialize(() => {
        db.run(`DROP TABLE IF EXISTS StudentAttendance_new`);

        db.run(`CREATE TABLE StudentAttendance_new (\n        ${colDefs}\n        )`, (err) => {
            if (err) return console.log('خطأ في إنشاء الجدول:', err.message);
            console.log('✅ جدول جديد بدون قيود');

            db.run(`INSERT INTO StudentAttendance_new (${colNames}) SELECT ${colNames} FROM StudentAttendance`, (err) => {
                if (err) return console.log('خطأ في النسخ:', err.message);
                console.log('✅ تم نسخ البيانات');

                db.run(`DROP TABLE StudentAttendance`, (err) => {
                    if (err) return console.log('خطأ في الحذف:', err.message);

                    db.run(`ALTER TABLE StudentAttendance_new RENAME TO StudentAttendance`, (err) => {
                        if (err) console.log('خطأ:', err.message);
                        else console.log('✅ تم إصلاح الجدول بنجاح! يمكنك الآن تسجيل أكثر من حضور في نفس اليوم.');
                    });
                });
            });
        });
    });
});

setTimeout(() => db.close(), 3000);