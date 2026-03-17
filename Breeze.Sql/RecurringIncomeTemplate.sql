CREATE TABLE [dbo].[RecurringIncomeTemplate]
(
    [Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1),
    [UserId] NVARCHAR(50) NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [Amount] DECIMAL(18, 2) NOT NULL,
    [ScheduleType] NVARCHAR(30) NOT NULL,
    [AnchorDate] DATE NOT NULL,
    [SemiMonthlyDay1] INT NULL,
    [SemiMonthlyDay2] INT NULL,
    [MonthlyDayOfMonth] INT NULL,
    [StartDate] DATE NOT NULL,
    [StopDate] DATE NULL,
    [IsActive] BIT NOT NULL CONSTRAINT [DF_RecurringIncomeTemplate_IsActive] DEFAULT ((1)),
    [CreatedAtUtc] DATETIME2 NOT NULL,
    [UpdatedAtUtc] DATETIME2 NOT NULL,
)

CREATE INDEX [IX_RecurringIncomeTemplate_UserId]
    ON [dbo].[RecurringIncomeTemplate] ([UserId]);
