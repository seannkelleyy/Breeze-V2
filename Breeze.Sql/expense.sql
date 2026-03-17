CREATE TABLE [dbo].[Expense]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1), 
    [UserId] NVARCHAR(50) NOT NULL, 
    [CategoryId] INT NOT NULL, 
    [Name] NVARCHAR(50) NOT NULL, 
    [Amount] DECIMAL(18, 2) NOT NULL,
    [Date] DATE NOT NULL,
    [IsRecurring] BIT NOT NULL CONSTRAINT [DF_Expense_IsRecurring] DEFAULT ((0)),
    [RecurrenceInterval] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Expense_RecurrenceInterval] DEFAULT ('none'),
    [DueDayOfMonth] INT NULL,
    CONSTRAINT [FK_Expense_Category] FOREIGN KEY ([CategoryId]) REFERENCES [Category]([Id]),
)