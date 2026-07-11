DELETE FROM TeacherContracts WHERE IsActive = 0;
DELETE FROM TeacherPayments WHERE ContractID NOT IN (SELECT ContractID FROM TeacherContracts WHERE IsActive = 1);