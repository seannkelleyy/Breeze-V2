CREATE TABLE [dbo].[RecurringCategoryTemplate]
(
    [Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1),
    [UserId] NVARCHAR(50) NOT NULL,
    [Name] NVARCHAR(200) NOT NULL,
    [Allocation] DECIMAL(18, 2) NOT NULL,
    [StartDate] DATE NOT NULL,
    [StopDate] DATE NULL,
    [IsActive] BIT NOT NULL CONSTRAINT [DF_RecurringCategoryTemplate_IsActive] DEFAULT ((1)),
    [CreatedAtUtc] DATETIME2 NOT NULL,
    [UpdatedAtUtc] DATETIME2 NOT NULL,
)

CREATE INDEX [IX_RecurringCategoryTemplate_UserId]
    ON [dbo].[RecurringCategoryTemplate] ([UserId]);
