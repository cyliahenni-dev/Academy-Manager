const express = require('express');
const router = express.Router();
const db = require('../db');
const ExcelJS = require('exceljs');

function getAllMonths(year) {
    return Array.from({ length: 12 }, (_, i) => `${year}-${(i+1).toString().padStart(2, '0')}`);
}

// Monthly Report - فقط العقود المدفوعة والنشطة
router.get('/monthly/:month', (req, res) => {
    const month = req.params.month;

    db.get(`SELECT COALESCE(SUM(AmountPaid), 0) as TotalStudentPayments 
            FROM StudentPayments 
            WHERE (MonthOfPayment = ? OR substr(PaymentDate, 1, 7) = ?)`, 
            [month, month], (err, income) => {

        db.get(`SELECT COALESCE(SUM(PaymentRate), 0) as TotalTeacherSalaries 
                FROM TeacherContracts 
                WHERE IsPaid = 1 AND IsActive = 1 
                AND (substr(StartDate, 1, 7) = ? OR StartDate LIKE ?)`, 
                [month, month + '%'], (err, salaries) => {

            db.get(`SELECT COALESCE(SUM(Amount), 0) as TotalOtherExpenses 
                    FROM OtherExpenses 
                    WHERE (MonthOfExpense = ? OR MonthOfExpense LIKE ?)`, 
                    [month, month + '%'], (err, other) => {

                const student = Number(income?.TotalStudentPayments || 0);
                const teacherSal = Number(salaries?.TotalTeacherSalaries || 0);
                const otherExp = Number(other?.TotalOtherExpenses || 0);

                res.json({
                    Month: month,
                    TotalStudentPayments: student,
                    TotalTeacherSalaries: teacherSal,
                    TotalOtherExpenses: otherExp,
                    TotalExpenses: teacherSal + otherExp,
                    NetProfit: student - (teacherSal + otherExp)
                });
            });
        });
    });
});

// Yearly Report
router.get('/yearly/:year', (req, res) => {
    const year = req.params.year;
    const months = getAllMonths(year);

    db.all(`SELECT substr(COALESCE(PaymentDate, MonthOfPayment || '-01'), 1, 7) as Month, 
                   COALESCE(SUM(AmountPaid), 0) as Income 
            FROM StudentPayments 
            WHERE substr(COALESCE(PaymentDate, MonthOfPayment || '-01'), 1, 4) = ? 
            GROUP BY Month`, [year], (err, incomeRows) => {

        db.all(`SELECT substr(StartDate, 1, 7) as Month, 
                       COALESCE(SUM(PaymentRate), 0) as TeacherSal 
                FROM TeacherContracts 
                WHERE IsPaid = 1 AND IsActive = 1 
                AND substr(StartDate, 1, 4) = ? 
                GROUP BY Month`, [year], (err, salaryRows) => {

            db.all(`SELECT substr(MonthOfExpense, 1, 7) as Month, 
                           COALESCE(SUM(Amount), 0) as Other 
                    FROM OtherExpenses 
                    WHERE substr(MonthOfExpense, 1, 4) = ? 
                    GROUP BY Month`, [year], (err, otherRows) => {

                const incMap = {}, salMap = {}, othMap = {};
                
                (incomeRows || []).forEach(r => incMap[r.Month] = Number(r.Income));
                (salaryRows || []).forEach(r => salMap[r.Month] = Number(r.TeacherSal));
                (otherRows || []).forEach(r => othMap[r.Month] = Number(r.Other));

                const monthlyReport = months.map(m => {
                    const inc = incMap[m] || 0;
                    const sal = salMap[m] || 0;
                    const oth = othMap[m] || 0;
                    return {
                        Month: m,
                        Income: inc,
                        TeacherSalaries: sal,
                        OtherExpenses: oth,
                        TotalExpenses: sal + oth,
                        Net: inc - (sal + oth)
                    };
                });

                const totalIncome = monthlyReport.reduce((sum, m) => sum + m.Income, 0);
                const totalTeacher = monthlyReport.reduce((sum, m) => sum + m.TeacherSalaries, 0);
                const totalOther = monthlyReport.reduce((sum, m) => sum + m.OtherExpenses, 0);
                const netGain = totalIncome - totalTeacher - totalOther;

                res.json({
                    MonthlyReport: monthlyReport,
                    TotalIncome: totalIncome,
                    TotalTeacherSalaries: totalTeacher,
                    TotalOtherExpenses: totalOther,
                    NetGain: netGain
                });
            });
        });
    });
});

// Excel Exports
router.get('/export/financial/:month', (req, res) => {
    const month = req.params.month;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`تقرير_شهري_${month}`);

    sheet.columns = [
        { header: 'البند', key: 'item', width: 30 },
        { header: 'المبلغ (د.ج)', key: 'amount', width: 20 }
    ];

    db.get(`SELECT 
        COALESCE((SELECT SUM(AmountPaid) FROM StudentPayments WHERE substr(COALESCE(PaymentDate, MonthOfPayment),1,7) = ?), 0) as Income,
        COALESCE((SELECT SUM(PaymentRate) FROM TeacherContracts WHERE IsPaid = 1 AND IsActive = 1 AND substr(StartDate,1,7) = ?), 0) as TeacherSal,
        COALESCE((SELECT SUM(Amount) FROM OtherExpenses WHERE MonthOfExpense = ?), 0) as OtherExp`, 
        [month, month, month], (err, data) => {

        const income = Number(data?.Income || 0);
        const teacher = Number(data?.TeacherSal || 0);
        const other = Number(data?.OtherExp || 0);

        sheet.addRows([
            { item: 'إيرادات الطلاب', amount: income },
            { item: 'رواتب المعلمين', amount: teacher },
            { item: 'مصروفات أخرى', amount: other },
            { item: 'إجمالي المصروفات', amount: teacher + other },
            { item: 'الربح الصافي', amount: income - (teacher + other) }
        ]);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=monthly_report_${month}.xlsx`);
        workbook.xlsx.write(res).then(() => res.end());
    });
});

router.get('/export/financial/yearly/2026', async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('تقرير_سنوي_2026');

    sheet.columns = [
        { header: 'الشهر', key: 'month', width: 15 },
        { header: 'الإيرادات', key: 'income', width: 18 },
        { header: 'رواتب المعلمين', key: 'teacher', width: 18 },
        { header: 'مصروفات أخرى', key: 'other', width: 18 },
        { header: 'إجمالي المصروفات', key: 'totalExp', width: 18 },
        { header: 'الربح', key: 'net', width: 18 }
    ];

    try {
        const year = '2026';
        const months = Array.from({ length: 12 }, (_, i) => `${year}-${(i+1).toString().padStart(2, '0')}`);

        const incomeRows = await new Promise((resolve) => {
            db.all(`SELECT substr(COALESCE(PaymentDate, MonthOfPayment || '-01'), 1, 7) as Month, 
                           COALESCE(SUM(AmountPaid), 0) as Income 
                    FROM StudentPayments 
                    WHERE substr(COALESCE(PaymentDate, MonthOfPayment || '-01'), 1, 4) = ? 
                    GROUP BY Month`, [year], (err, rows) => resolve(rows || []));
        });

        const salaryRows = await new Promise((resolve) => {
            db.all(`SELECT substr(StartDate, 1, 7) as Month, 
                           COALESCE(SUM(PaymentRate), 0) as TeacherSal 
                    FROM TeacherContracts 
                    WHERE IsPaid = 1 AND IsActive = 1 
                    AND substr(StartDate, 1, 4) = ? 
                    GROUP BY Month`, [year], (err, rows) => resolve(rows || []));
        });

        const otherRows = await new Promise((resolve) => {
            db.all(`SELECT substr(MonthOfExpense, 1, 7) as Month, 
                           COALESCE(SUM(Amount), 0) as Other 
                    FROM OtherExpenses 
                    WHERE substr(MonthOfExpense, 1, 4) = ? 
                    GROUP BY Month`, [year], (err, rows) => resolve(rows || []));
        });

        const incMap = {}, salMap = {}, othMap = {};
        incomeRows.forEach(r => incMap[r.Month] = Number(r.Income));
        salaryRows.forEach(r => salMap[r.Month] = Number(r.TeacherSal));
        otherRows.forEach(r => othMap[r.Month] = Number(r.Other));

        let totalIncome = 0, totalTeacher = 0, totalOther = 0;

        const monthlyData = months.map(m => {
            const inc = incMap[m] || 0;
            const sal = salMap[m] || 0;
            const oth = othMap[m] || 0;
            const net = inc - sal - oth;

            totalIncome += inc;
            totalTeacher += sal;
            totalOther += oth;

            return { month: m, income: inc, teacher: sal, other: oth, totalExp: sal + oth, net };
        });

        sheet.addRows(monthlyData);

        // إضافة الإجماليات في الأسفل
        sheet.addRow({});
        sheet.addRow({ month: 'الإجمالي', income: totalIncome, teacher: totalTeacher, other: totalOther, totalExp: totalTeacher + totalOther, net: totalIncome - totalTeacher - totalOther });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=yearly_report_2026.xlsx');
        workbook.xlsx.write(res).then(() => res.end());
    } catch (err) {
        console.error(err);
        res.status(500).send('خطأ في إنشاء التقرير السنوي');
    }
});

module.exports = router;