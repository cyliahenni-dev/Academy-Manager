const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// تعطيل ETag: يمنع المتصفح من استعمال ردود قديمة محفوظة (304 Not Modified)
// وهو سبب ظهور بيانات قديمة بعد الحذف/التعديل رغم نجاح العملية فعليا فـ القاعدة
app.set('etag', false);

app.use(cors());
app.use(express.json());

// يمنع أي تخزين مؤقت لكل طلبات الـ API (بيانات دائما محدثة)
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

console.log("📁 Serving from public/");

// Import routes
const studentsRouter = require('./routes/students');
const teachersRouter = require('./routes/teachers');
const attendanceRouter = require('./routes/attendance');
const paymentsRouter = require('./routes/payments');
const contractsRouter = require('./routes/contracts');
const reportsRouter = require('./routes/reports');
const expensesRouter = require('./routes/expenses');

app.use('/api/students', studentsRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/expenses', expensesRouter);

// Catch-all route for SPA / HTML files
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Server running successfully on http://localhost:${PORT}`);
});

module.exports = app;