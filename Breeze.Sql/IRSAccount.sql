CREATE TABLE [dbo].[IRSAccount]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1),
    [Type] NVARCHAR(100) NOT NULL,
    [MaxAmount] DECIMAL(18, 2) NOT NULL,
    [FamilyMaxAmount] DECIMAL(18, 2) NULL,
    [CatchUpAmount] DECIMAL(18, 2) NOT NULL,
    [CatchUpAge] INT NOT NULL,
)

IF COL_LENGTH('dbo.IRSAccount', 'FamilyMaxAmount') IS NULL
BEGIN
    ALTER TABLE [dbo].[IRSAccount]
    ADD [FamilyMaxAmount] DECIMAL(18, 2) NULL
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[IRSAccount] WHERE [Type] = '401k')
BEGIN
    INSERT INTO [dbo].[IRSAccount] ([Type], [MaxAmount], [FamilyMaxAmount], [CatchUpAmount], [CatchUpAge])
    VALUES ('401k', 24500.00, NULL, 8000.00, 50)
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[IRSAccount] WHERE [Type] = 'Roth IRA')
BEGIN
    INSERT INTO [dbo].[IRSAccount] ([Type], [MaxAmount], [FamilyMaxAmount], [CatchUpAmount], [CatchUpAge])
    VALUES ('Roth IRA', 7500.00, NULL, 1100.00, 50)
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[IRSAccount] WHERE [Type] = 'Traditional IRA')
BEGIN
    INSERT INTO [dbo].[IRSAccount] ([Type], [MaxAmount], [FamilyMaxAmount], [CatchUpAmount], [CatchUpAge])
    VALUES ('Traditional IRA', 7500.00, NULL, 1100.00, 50)
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[IRSAccount] WHERE [Type] = 'HSA')
BEGIN
    INSERT INTO [dbo].[IRSAccount] ([Type], [MaxAmount], [FamilyMaxAmount], [CatchUpAmount], [CatchUpAge])
    VALUES ('HSA', 4400.00, 8750.00, 1000.00, 55)
END

UPDATE [dbo].[IRSAccount]
SET [MaxAmount] = 24500.00,
    [CatchUpAmount] = 8000.00,
    [CatchUpAge] = 50,
    [FamilyMaxAmount] = NULL
WHERE [Type] = '401k'

UPDATE [dbo].[IRSAccount]
SET [MaxAmount] = 7500.00,
    [CatchUpAmount] = 1100.00,
    [CatchUpAge] = 50,
    [FamilyMaxAmount] = NULL
WHERE [Type] IN ('Roth IRA', 'Traditional IRA')

UPDATE [dbo].[IRSAccount]
SET [MaxAmount] = 4400.00,
    [FamilyMaxAmount] = 8750.00,
    [CatchUpAmount] = 1000.00,
    [CatchUpAge] = 55
WHERE [Type] = 'HSA'
