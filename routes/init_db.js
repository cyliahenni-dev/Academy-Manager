const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    console.log("Creating tables...");

    // Users
    db.run(`CREATE TABLE IF NOT EXISTS Users (
        UserID INTEGER PRIMARY KEY AUTOINCREMENT,
        Username TEXT UNIQUE NOT NULL,
        PasswordHash TEXT NOT NULL,
        Role TEXT NOT NULL,
        IsActive BOOLEAN DEFAULT 1,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Levels
    db.run(`CREATE TABLE IF NOT EXISTS Levels (
        LevelID INTEGER PRIMARY KEY AUTOINCREMENT,
        LevelName TEXT NOT NULL,
        MonthlyFee REAL NOT NULL,
        Description TEXT
    )`);

    // Students
    db.run(`CREATE TABLE IF NOT EXISTS Students (
        StudentID INTEGER PRIMARY KEY AUTOINCREMENT,
        FirstName TEXT NOT NULL,
        LastName TEXT NOT NULL,
        LevelID INTEGER,
        CardUID TEXT UNIQUE,
        Phone TEXT,
        ParentPhone TEXT,
        RegistrationDate DATE DEFAULT CURRENT_DATE,
        IsActive BOOLEAN DEFAULT 1,
        FOREIGN KEY(LevelID) REFERENCES Levels(LevelID)
    )`);

    // Student Attendance
    db.run(`CREATE TABLE IF NOT EXISTS StudentAttendance (
        AttendanceID INTEGER PRIMARY KEY AUTOINCREMENT,
        StudentID INTEGER,
        Date DATE DEFAULT CURRENT_DATE,
        Time TIME DEFAULT CURRENT_TIME,
        Present BOOLEAN DEFAULT 1,
        Notes TEXT,
        FOREIGN KEY(StudentID) REFERENCES Students(StudentID),
        UNIQUE(StudentID, Date)
    )`);

    // Student Payments
    db.run(`CREATE TABLE IF NOT EXISTS StudentPayments (
        PaymentID INTEGER PRIMARY KEY AUTOINCREMENT,
        StudentID INTEGER,
        MonthOfPayment TEXT,
        AmountPaid REAL NOT NULL,
        Remaining REAL DEFAULT 0,
        PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        ReceiptNumber TEXT UNIQUE,
        Notes TEXT,
        FOREIGN KEY(StudentID) REFERENCES Students(StudentID)
    )`);

    // Teachers
    db.run(`CREATE TABLE IF NOT EXISTS Teachers (
        TeacherID INTEGER PRIMARY KEY AUTOINCREMENT,
        FirstName TEXT NOT NULL,
        LastName TEXT NOT NULL,
        Phone TEXT,
        Email TEXT,
        Subject TEXT,
        IsActive BOOLEAN DEFAULT 1
    )`);

    // Teacher Contracts
    db.run(`CREATE TABLE IF NOT EXISTS TeacherContracts (
        ContractID INTEGER PRIMARY KEY AUTOINCREMENT,
        TeacherID INTEGER,
        LevelID INTEGER,
        Subject TEXT NOT NULL,
        StartDate DATE NOT NULL,
        EndDate DATE,
        PaymentMode TEXT NOT NULL,
        PaymentRate REAL NOT NULL,
        Notes TEXT,
        IsActive BOOLEAN DEFAULT 1,
        FOREIGN KEY(TeacherID) REFERENCES Teachers(TeacherID)
    )`);

    console.log("✅ Database tables created successfully!");
});

db.close();