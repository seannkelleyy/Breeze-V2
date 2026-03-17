CREATE TABLE [dbo].[UserPreference]
(
	[UserId] NVARCHAR(50) NOT NULL PRIMARY KEY,
	[CurrencyCode] NVARCHAR(3) NOT NULL CONSTRAINT [DF_UserPreference_CurrencyCode] DEFAULT ('USD'),
	[ReturnDisplayMode] NVARCHAR(20) NOT NULL CONSTRAINT [DF_UserPreference_ReturnDisplayMode] DEFAULT ('nominal'),
	[InflationRate] DECIMAL(9, 4) NOT NULL CONSTRAINT [DF_UserPreference_InflationRate] DEFAULT (2.5),
	[SafeWithdrawalRate] DECIMAL(9, 4) NOT NULL CONSTRAINT [DF_UserPreference_SafeWithdrawalRate] DEFAULT (4.0)
)
