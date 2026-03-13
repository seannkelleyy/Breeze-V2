using Breeze.Api.Planner.RequestResponseObjects;
using Breeze.Data;
using Breeze.Domain;

namespace Breeze.Api.Planner
{
    public class PlannerService
    {
        private readonly ILogger _logger;
        private readonly BreezeContext db;

        public PlannerService(IConfiguration config, BreezeContext dbContext, ILogger logger)
        {
            _logger = logger;
            db = dbContext;
        }

        public PlannerResponse? GetPlannerByUserId(string userId)
        {
            try
            {
                var profile = FindPlannerProfileByUserId(userId);
                if (profile is null)
                {
                    var latestBudgetMonthlyExpenses = GetLatestBudgetMonthlyExpenses(userId);
					var normalizedUserId = NormalizeUserId(userId);
					var now = DateTime.UtcNow;

					profile = new PlannerProfile
					{
						UserId = normalizedUserId,
						DesiredInvestmentAmount = 0,
						MonthlyExpenses = latestBudgetMonthlyExpenses,
						InflationRate = 0,
						SafeWithdrawalRate = 0,
						CreatedAtUtc = now,
						UpdatedAtUtc = now,
					};

					db.PlannerProfiles.Add(profile);
					db.SaveChanges();

					return new PlannerResponse
                    {
                        Id = profile.Id,
                        UserId = profile.UserId,
                        DesiredInvestmentAmount = profile.DesiredInvestmentAmount,
                        MonthlyExpenses = profile.MonthlyExpenses,
                        InflationRate = profile.InflationRate,
                        SafeWithdrawalRate = profile.SafeWithdrawalRate,
                        CreatedAtUtc = profile.CreatedAtUtc,
                        UpdatedAtUtc = profile.UpdatedAtUtc,
                        People = new List<PlannerPersonResponse>(),
                        Accounts = new List<PlannerAccountResponse>(),
                    };
                }

                var people = db.PlannerPeople
                    .Where(person => person.PlannerProfileId.Equals(profile.Id))
                    .Select(person => new PlannerPersonResponse
                    {
                        Id = person.Id,
                        PersonType = person.PersonType,
                        Name = person.Name,
                        Birthday = person.Birthday,
                        RetirementAge = person.RetirementAge,
                        AnnualSalary = person.AnnualSalary,
                        BonusMode = string.IsNullOrWhiteSpace(person.BonusMode) ? "dollars" : person.BonusMode,
                        AnnualBonus = person.AnnualBonus,
                        IncomeGrowthRate = person.IncomeGrowthRate,
                    })
                    .ToList();

                var accounts = db.PlannerAccounts
                    .Where(account => account.PlannerProfileId.Equals(profile.Id))
                    .Select(account => new PlannerAccountResponse
                    {
                        Id = account.Id,
                        Name = account.Name,
                        Owner = account.Owner,
                        AccountType = account.AccountType,
                        ContributionMode = account.ContributionMode,
                        ContributionValue = account.ContributionValue,
                        EmployerMatchRate = account.EmployerMatchRate,
                        EmployerMatchMaxPercentOfSalary = account.EmployerMatchMaxPercentOfSalary,
                        StartingBalance = account.StartingBalance,
                        AnnualRate = account.AnnualRate,
                        PurchaseDate = account.PurchaseDate,
                        PurchasePrice = account.PurchasePrice,
                        CurrentValue = account.CurrentValue,
                        AnnualChangeRate = account.AnnualChangeRate,
                        HomeGrowthProfile = account.HomeGrowthProfile,
                        VehicleDepreciationProfile = account.VehicleDepreciationProfile,
                        HasLoan = account.HasLoan,
                        LoanInterestRate = account.LoanInterestRate,
                        OriginalLoanAmount = account.OriginalLoanAmount,
                        LoanMonthlyPayment = account.LoanMonthlyPayment,
                        LoanTermYears = account.LoanTermYears,
                        LoanStartDate = account.LoanStartDate,
                        CurrentLoanBalance = account.CurrentLoanBalance,
                    })
                    .ToList();

                return new PlannerResponse
                {
                    Id = profile.Id,
                    UserId = profile.UserId,
                    DesiredInvestmentAmount = profile.DesiredInvestmentAmount,
                    MonthlyExpenses = profile.MonthlyExpenses,
                    InflationRate = profile.InflationRate,
                    SafeWithdrawalRate = profile.SafeWithdrawalRate,
                    CreatedAtUtc = profile.CreatedAtUtc,
                    UpdatedAtUtc = profile.UpdatedAtUtc,
                    People = people,
                    Accounts = accounts,
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }

        public decimal GetLatestBudgetMonthlyExpenses(string userId)
        {
            try
            {
                var budgets = db.Budgets
                    .Where(budget => budget.UserId.Equals(userId))
                    .OrderByDescending(budget => budget.Date)
                    .Select(budget => new
                    {
                        budget.Id,
                        budget.Date,
                        budget.MonthlyExpenses,
                    })
                    .ToList();

                if (budgets.Count == 0)
                {
                    return 0;
                }

                foreach (var budget in budgets)
                {
                    if (budget.MonthlyExpenses > 0)
                    {
                        return budget.MonthlyExpenses;
                    }

                    var budgetCategoryAllocationTotal = db.Categories
                        .Where(category => category.UserId.Equals(userId) && category.BudgetId.Equals(budget.Id))
                        .Select(category => (decimal?)category.Allocation)
                        .Sum() ?? 0;

                    if (budgetCategoryAllocationTotal > 0)
                    {
                        return budgetCategoryAllocationTotal;
                    }

                    var budgetMonthExpenseTotal = db.Expenses
                        .Where(expense =>
                            expense.UserId.Equals(userId)
                            && expense.Date.Month == budget.Date.Month
                            && expense.Date.Year == budget.Date.Year)
                        .Select(expense => (decimal?)expense.Amount)
                        .Sum() ?? 0;

                    if (budgetMonthExpenseTotal > 0)
                    {
                        return budgetMonthExpenseTotal;
                    }

                    var budgetCategoryIds = db.Categories
                        .Where(category => category.UserId.Equals(userId) && category.BudgetId.Equals(budget.Id))
                        .Select(category => category.Id)
                        .ToList();

                    if (budgetCategoryIds.Count > 0)
                    {
                        var budgetCategoryExpenseTotal = db.Expenses
                            .Where(expense => expense.UserId.Equals(userId) && budgetCategoryIds.Contains(expense.CategoryId))
                            .Select(expense => (decimal?)expense.Amount)
                            .Sum() ?? 0;

                        if (budgetCategoryExpenseTotal > 0)
                        {
                            return budgetCategoryExpenseTotal;
                        }

                        var budgetCategorySpendTotal = db.Categories
                            .Where(category => category.UserId.Equals(userId) && category.BudgetId.Equals(budget.Id))
                            .Select(category => (decimal?)category.CurrentSpend)
                            .Sum() ?? 0;

                        if (budgetCategorySpendTotal > 0)
                        {
                            return budgetCategorySpendTotal;
                        }
                    }
                }

                return budgets[0].MonthlyExpenses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return 0;
            }
        }

        public int UpsertPlanner(string userId, PlannerRequest plannerRequest)
        {
            using var transaction = db.Database.BeginTransaction();

            try
            {
                var now = DateTime.UtcNow;
                var normalizedUserId = NormalizeUserId(userId);
                var existingProfile = FindPlannerProfileByUserId(userId);
                if (existingProfile is null)
                {
                    existingProfile = new PlannerProfile
                    {
                        UserId = normalizedUserId,
                        DesiredInvestmentAmount = plannerRequest.DesiredInvestmentAmount,
                        MonthlyExpenses = plannerRequest.MonthlyExpenses,
                        InflationRate = plannerRequest.InflationRate,
                        SafeWithdrawalRate = plannerRequest.SafeWithdrawalRate,
                        CreatedAtUtc = now,
                        UpdatedAtUtc = now,
                    };

                    db.PlannerProfiles.Add(existingProfile);
                    db.SaveChanges();
                }
                else
                {
                    existingProfile.DesiredInvestmentAmount = plannerRequest.DesiredInvestmentAmount;
                    existingProfile.MonthlyExpenses = plannerRequest.MonthlyExpenses;
                    existingProfile.InflationRate = plannerRequest.InflationRate;
                    existingProfile.SafeWithdrawalRate = plannerRequest.SafeWithdrawalRate;
                    existingProfile.UpdatedAtUtc = now;

                    db.PlannerProfiles.Update(existingProfile);
                    db.SaveChanges();
                }

                var existingPeople = db.PlannerPeople.Where(person => person.PlannerProfileId.Equals(existingProfile.Id)).ToList();
                if (existingPeople.Count > 0)
                {
                    db.PlannerPeople.RemoveRange(existingPeople);
                }

                var existingAccounts = db.PlannerAccounts.Where(account => account.PlannerProfileId.Equals(existingProfile.Id)).ToList();
                if (existingAccounts.Count > 0)
                {
                    db.PlannerAccounts.RemoveRange(existingAccounts);
                }

                db.SaveChanges();

                var peopleToInsert = plannerRequest.People.Select(person => new PlannerPerson
                {
                    PlannerProfileId = existingProfile.Id,
                    PersonType = person.PersonType,
                    Name = person.Name,
                    Birthday = NormalizeToUtc(person.Birthday),
                    RetirementAge = person.RetirementAge,
                    AnnualSalary = person.AnnualSalary,
                    BonusMode = NormalizeBonusMode(person.BonusMode),
                    AnnualBonus = person.AnnualBonus,
                    IncomeGrowthRate = person.IncomeGrowthRate,
                }).ToList();

                var accountsToInsert = plannerRequest.Accounts.Select(account => new PlannerAccount
                {
                    PlannerProfileId = existingProfile.Id,
                    Name = account.Name,
                    Owner = account.Owner,
                    AccountType = account.AccountType,
                    ContributionMode = account.ContributionMode,
                    ContributionValue = account.ContributionValue,
                    EmployerMatchRate = account.EmployerMatchRate,
                    EmployerMatchMaxPercentOfSalary = account.EmployerMatchMaxPercentOfSalary,
                    StartingBalance = account.StartingBalance,
                    AnnualRate = account.AnnualRate,
                    PurchaseDate = NormalizeNullableToUtc(account.PurchaseDate),
                    PurchasePrice = account.PurchasePrice,
                    CurrentValue = account.CurrentValue,
                    AnnualChangeRate = account.AnnualChangeRate,
                    HomeGrowthProfile = account.HomeGrowthProfile,
                    VehicleDepreciationProfile = account.VehicleDepreciationProfile,
                    HasLoan = account.HasLoan,
                    LoanInterestRate = account.LoanInterestRate,
                    OriginalLoanAmount = account.OriginalLoanAmount,
                    LoanMonthlyPayment = account.LoanMonthlyPayment,
                    LoanTermYears = account.LoanTermYears,
                    LoanStartDate = NormalizeNullableToUtc(account.LoanStartDate),
                    CurrentLoanBalance = account.CurrentLoanBalance,
                }).ToList();

                if (peopleToInsert.Count > 0)
                {
                    db.PlannerPeople.AddRange(peopleToInsert);
                }

                if (accountsToInsert.Count > 0)
                {
                    db.PlannerAccounts.AddRange(accountsToInsert);
                }

                db.SaveChanges();
                transaction.Commit();
                return existingProfile.Id;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError(ex.Message);
                return -5;
            }
        }

        private PlannerProfile? FindPlannerProfileByUserId(string userId)
        {
            var normalizedUserId = NormalizeUserId(userId);

            var exactProfile = db.PlannerProfiles
                .FirstOrDefault(profile => profile.UserId == normalizedUserId);
            if (exactProfile is not null)
            {
                return exactProfile;
            }

            // Legacy safety: tolerate whitespace/casing drift in stored user IDs.
            return db.PlannerProfiles
                .FirstOrDefault(profile => profile.UserId != null
                    && profile.UserId.Trim().ToLower() == normalizedUserId.ToLower());
        }

        private static string NormalizeUserId(string userId)
        {
            return userId.Trim();
        }

        private static DateTime NormalizeToUtc(DateTime value)
        {
            if (value.Kind == DateTimeKind.Utc)
            {
                return value;
            }

            if (value.Kind == DateTimeKind.Local)
            {
                return value.ToUniversalTime();
            }

            return DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        private static DateTime? NormalizeNullableToUtc(DateTime? value)
        {
            return value.HasValue ? NormalizeToUtc(value.Value) : null;
        }

        private static string NormalizeBonusMode(string? bonusMode)
        {
            return string.Equals(bonusMode, "salary-percent", StringComparison.OrdinalIgnoreCase)
                ? "salary-percent"
                : "dollars";
        }
    }
}
