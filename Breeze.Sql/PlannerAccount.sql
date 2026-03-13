CREATE TABLE [dbo].[PlannerAccount]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1),
	[PlannerProfileId] INT NOT NULL,
	[Name] NVARCHAR(100) NOT NULL,
	[Owner] NVARCHAR(20) NOT NULL,
	[AccountType] NVARCHAR(30) NOT NULL,
	[ContributionMode] NVARCHAR(20) NOT NULL,
	[ContributionValue] DECIMAL(18, 2) NOT NULL,
	[EmployerMatchRate] DECIMAL(9, 4) NOT NULL,
	[EmployerMatchMaxPercentOfSalary] DECIMAL(9, 4) NOT NULL,
	[StartingBalance] DECIMAL(18, 2) NOT NULL,
	[AnnualRate] DECIMAL(9, 4) NOT NULL,
	[PurchaseDate] DATE NULL,
	[PurchasePrice] DECIMAL(18, 2) NULL,
	[CurrentValue] DECIMAL(18, 2) NULL,
	[AnnualChangeRate] DECIMAL(9, 4) NULL,
	[HomeGrowthProfile] NVARCHAR(20) NULL,
	[VehicleDepreciationProfile] NVARCHAR(20) NULL,
	[HasLoan] BIT NOT NULL CONSTRAINT [DF_PlannerAccount_HasLoan] DEFAULT 0,
	[LoanInterestRate] DECIMAL(9, 4) NULL,
	[LoanMonthlyPayment] DECIMAL(18, 2) NULL,
	[OriginalLoanAmount] DECIMAL(18, 2) NULL,
	[LoanTermYears] INT NULL,
	[LoanStartDate] DATE NULL,
	[CurrentLoanBalance] DECIMAL(18, 2) NULL,
	CONSTRAINT [FK_PlannerAccount_PlannerProfile] FOREIGN KEY ([PlannerProfileId]) REFERENCES [PlannerProfile]([Id]) ON DELETE CASCADE,
	CONSTRAINT [CK_PlannerAccount_Owner] CHECK ([Owner] IN ('self', 'spouse')),
	CONSTRAINT [CK_PlannerAccount_ContributionMode] CHECK ([ContributionMode] IN ('monthly', 'yearly', 'salary-percent')),
	CONSTRAINT [CK_PlannerAccount_HomeGrowthProfile] CHECK ([HomeGrowthProfile] IS NULL OR [HomeGrowthProfile] IN ('none', 'low', 'medium', 'high', 'custom')),
	CONSTRAINT [CK_PlannerAccount_VehicleDepreciationProfile] CHECK ([VehicleDepreciationProfile] IS NULL OR [VehicleDepreciationProfile] IN ('low', 'medium', 'high', 'custom'))
)

CREATE INDEX [IX_PlannerAccount_PlannerProfileId] ON [dbo].[PlannerAccount] ([PlannerProfileId])
