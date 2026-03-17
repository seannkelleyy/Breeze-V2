CREATE TABLE [dbo].[Income]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1), 
    [UserId] NVARCHAR(50) NOT NULL, 
    [BudgetId] INT NOT NULL, 
    [Name] NVARCHAR(50) NOT NULL, 
    [Amount] DECIMAL(18, 2) NOT NULL,
    [Date] DATE NOT NULL,
    [IsRecurring] BIT NOT NULL CONSTRAINT [DF_Income_IsRecurring] DEFAULT ((0)),
    [RecurrenceInterval] NVARCHAR(20) NOT NULL CONSTRAINT [DF_Income_RecurrenceInterval] DEFAULT ('none'),
    [PaydayDayOfMonth] INT NULL,
    [SourceType] NVARCHAR(30) NOT NULL CONSTRAINT [DF_Income_SourceType] DEFAULT ('manual'),
    [SourceTemplateId] INT NULL,
    [SourceOccurrenceDate] DATE NULL,
    [GenerationMonth] DATE NULL,
    CONSTRAINT [FK_Income_Budget] FOREIGN KEY ([BudgetId]) REFERENCES [Budget]([Id]),
)

CREATE INDEX [IX_Income_SourceTemplate]
    ON [dbo].[Income] ([UserId], [BudgetId], [SourceTemplateId], [SourceOccurrenceDate]);
