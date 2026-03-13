CREATE TABLE [dbo].[PlannerPerson]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1),
	[PlannerProfileId] INT NOT NULL,
	[PersonType] NVARCHAR(20) NOT NULL,
	[Name] NVARCHAR(100) NOT NULL,
	[Birthday] DATE NOT NULL,
	[RetirementAge] INT NOT NULL,
	[AnnualSalary] DECIMAL(18, 2) NOT NULL,
	[BonusMode] NVARCHAR(20) NOT NULL CONSTRAINT [DF_PlannerPerson_BonusMode] DEFAULT 'dollars',
	[AnnualBonus] DECIMAL(18, 2) NOT NULL CONSTRAINT [DF_PlannerPerson_AnnualBonus] DEFAULT 0,
	[IncomeGrowthRate] DECIMAL(9, 4) NOT NULL CONSTRAINT [DF_PlannerPerson_IncomeGrowthRate] DEFAULT 0,
	CONSTRAINT [FK_PlannerPerson_PlannerProfile] FOREIGN KEY ([PlannerProfileId]) REFERENCES [PlannerProfile]([Id]) ON DELETE CASCADE,
	CONSTRAINT [CK_PlannerPerson_PersonType] CHECK ([PersonType] IN ('self', 'spouse')),
	CONSTRAINT [CK_PlannerPerson_BonusMode] CHECK ([BonusMode] IN ('dollars', 'salary-percent')),
	CONSTRAINT [UQ_PlannerPerson_ProfileId_PersonType] UNIQUE ([PlannerProfileId], [PersonType])
)

CREATE INDEX [IX_PlannerPerson_PlannerProfileId] ON [dbo].[PlannerPerson] ([PlannerProfileId])
