CREATE TABLE [dbo].[PlannerProfile]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1),
	[UserId] NVARCHAR(50) NOT NULL,
	[DesiredInvestmentAmount] DECIMAL(18, 2) NOT NULL,
	[MonthlyExpenses] DECIMAL(18, 2) NOT NULL,
	[InflationRate] DECIMAL(9, 4) NOT NULL,
	[SafeWithdrawalRate] DECIMAL(9, 4) NOT NULL,
	[CreatedAtUtc] DATETIME2 NOT NULL CONSTRAINT [DF_PlannerProfile_CreatedAtUtc] DEFAULT (SYSUTCDATETIME()),
	[UpdatedAtUtc] DATETIME2 NOT NULL CONSTRAINT [DF_PlannerProfile_UpdatedAtUtc] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [UQ_PlannerProfile_UserId] UNIQUE ([UserId])
)
