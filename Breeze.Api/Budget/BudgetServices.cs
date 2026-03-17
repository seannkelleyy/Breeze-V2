using Breeze.Api.Budget.RequestResponseObjects;
using Breeze.Api.Categories.RequestResponseObjects;
using Breeze.Api.Incomes.RequestResponseObjects;
using Breeze.Data;
using Breeze.Domain;
using Microsoft.EntityFrameworkCore;

namespace Breeze.Api.Budgets
{
    /// <summary>
    /// Service for managing budgets.
    /// </summary>
    public class BudgetService
    {
        private IConfiguration _config;
        private readonly ILogger _logger;
        private readonly BreezeContext db;

        /// <summary>
        /// Initializes a new instance of the <see cref="BudgetService"/> class.
        /// </summary>
        /// <param name="config">Configuration interface.</param>
        /// <param name="dbContext">Database context for Breeze.</param>
        /// <param name="logger">Logger for logging errors and information.</param>
        public BudgetService(IConfiguration config, BreezeContext dbContext, ILogger logger)
        {
            _config = config;
            _logger = logger;
            db = dbContext;
        }

        /// <summary>
        /// Retrieves a budget for a specified user, year, and month.
        /// </summary>
        /// <param name="userId">The user's identifier.</param>
        /// <param name="date">The Date of the budget.</param>
        /// <returns>A budget response object or null if not found.</returns>
        public BudgetResponse? GetBudgetByDate(string userId, DateOnly date)
        {
            try
            {
                var budget = db.Budgets
                    .Where(b => b.UserId.Equals(userId) && b.Date.Month == date.Month && b.Date.Year == date.Year)
                    .FirstOrDefault();

                if (budget == null)
                {
                    // Create a new budget
                    Domain.Budget newBudget = new Domain.Budget
                    {
                        UserId = userId,
                        MonthlyIncome = 0,
                        MonthlyExpenses = 0,
                        Date = date
                    };
                    db.Budgets.Add(newBudget);
                    db.SaveChanges();
                    budget = newBudget;
                }

                GenerateRecurringRowsForBudget(userId, budget);
                RecalculateBudgetTotals(userId, budget);

                // Convert to BudgetResponse
                var budgetResponse = new BudgetResponse
                {
                    Id = budget.Id,
                    UserId = budget.UserId,
                    MonthlyIncome = budget.MonthlyIncome,
                    MonthlyExpenses = budget.MonthlyExpenses,
                    Date = budget.Date,
                };

                return budgetResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }

        /// <summary>
        /// Creates a new budget for a user.
        /// </summary>
        /// <param name="userId">The user's identifier.</param>
        /// <param name="newBudget">The budget request object containing the new budget details.</param>
        /// <returns>
        /// The ID of the created budget, or -5 for an unknown error.
        /// </returns>
        public int CreateBudget(string userId, BudgetRequest newBudget)
        {
            try
            {
                var existingBudget = GetBudgetByDate(userId, newBudget.Date);
                if (existingBudget != null)
                {
                    return existingBudget.Id;
                }
                Domain.Budget budget = new Domain.Budget
                {
                    UserId = userId,
                    MonthlyIncome = newBudget.MonthlyIncome,
                    MonthlyExpenses = newBudget.MonthlyExpenses,
                    Date = newBudget.Date,

                };
                db.Budgets.Add(budget);
                db.SaveChanges();
                return budget.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return -5;
            }
        }

        /// <summary>
        /// Updates an existing budget for a user.
        /// </summary>
        /// <param name="userId">The user's identifier.</param>
        /// <param name="updatedBudget">The budget request object containing the updated budget details.</param>
        /// <returns>
        /// The ID of the updated budget, or one of the following error codes:
        /// -2: Cannot find item.
        /// -4: Unauthorized access.
        /// -5: Unknown error.
        /// </returns>
        public int UpdateBudget(string userId, BudgetRequest updatedBudget)
        {
            try
            {
                var existingBudget = db.Budgets.Find(updatedBudget.Id);
                if (existingBudget is null)
                {
                    return -2;
                }
                if (!existingBudget.UserId.Equals(userId))
                {
                    return -4;
                }
                existingBudget.MonthlyIncome = updatedBudget.MonthlyIncome;
                existingBudget.MonthlyExpenses = updatedBudget.MonthlyExpenses;
                db.Budgets.Update(existingBudget);
                db.SaveChanges();
                return existingBudget.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return -5;
            }
        }

        /// <summary>
        /// Deletes a budget by its ID for a specified user.
        /// </summary>
        /// <param name="userId">The user's identifier.</param>
        /// <param name="budgetId">The budget's identifier.</param>
        /// <returns>
        /// The ID of the deleted budget, or one of the following error codes:
        /// -2: Cannot find item.
        /// -4: Unauthorized access.
        /// -5: Unknown error.
        /// </returns>
        public int DeleteBudgetById(string userId, int budgetId)
        {
            try
            {
                var budget = db.Budgets.Find(budgetId);
                if (budget == null)
                {
                    return -2;
                }
                if (!budget.UserId.Equals(userId))
                {
                    return -4;
                }
                db.Budgets.Remove(budget);
                db.SaveChanges();
                return budgetId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return -5;
            }

        }

        /// <summary>
        /// Recalculates the total budget income when adding a new income.
        /// </summary>
        /// <param name="userId">The user's identifier.</param>
        /// <param name="budgetId">The budget's identifier to which incomes are added.</param>
        /// <param name="incomes">The list of incomes to add.</param>
        /// <returns>
        /// The ID of the budget to which incomes were added, or one of the following error codes:
        /// -2: Cannot find the budget.
        /// -4: User ID does not match.
        /// -5: Unknown error.
        /// </returns>
        public int CalculateBudgetIncomes(string userId, int budgetId, List<IncomeResponse> incomes)
        {
            try
            {
                var existingBudget = db.Budgets.Find(budgetId);
                if (existingBudget is null)
                {
                    return -2;
                }
                if (!existingBudget.UserId.Equals(userId))
                {
                    return -4;
                }

                decimal totalIncome = 0;
                var budgetDate = existingBudget.Date;

                foreach (var income in incomes)
                {
                    var occurrences = GetOccurrencesForMonth(
                        budgetDate,
                        income.IsRecurring,
                        income.RecurrenceInterval,
                        income.Date,
                        income.PaydayDayOfMonth,
                        income.Date.Day
                    );
                    totalIncome += income.Amount * occurrences;
                }

                existingBudget.MonthlyIncome = totalIncome;

                db.Budgets.Update(existingBudget);
                db.SaveChanges();
                return existingBudget.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return -5;
            }
        }

        /// <summary>
        /// Recalculates the total budget expenses when adding a new category.
        /// </summary>
        /// <param name="userId">The user's identifier.</param>
        /// <param name="budgetId">The budget's identifier to which categories are added.</param>
        /// <param name="categories">The list of categories to add.</param>
        /// <returns>
        /// The ID of the budget to which categories were added, or one of the following error codes:
        /// -2: Cannot find the budget.
        /// -4: User ID does not match.
        /// -5: Unknown error.
        /// </returns>
        public int CalculateBudgetCategories(string userId, int budgetId, List<CategoryResponse> categories)
        {
            try
            {
                var existingBudget = db.Budgets.Find(budgetId);
                if (existingBudget is null)
                {
                    return -2;
                }
                if (!existingBudget.UserId.Equals(userId))
                {
                    return -4;
                }

                decimal totalExpenses = categories.Sum(category => category.Allocation);

                existingBudget.MonthlyExpenses = totalExpenses;

                db.Budgets.Update(existingBudget);
                db.SaveChanges();
                return existingBudget.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return -5;
            }
        }

        private static int GetOccurrencesForMonth(
            DateOnly budgetDate,
            bool isRecurring,
            string? recurrenceInterval,
            DateOnly anchorDate,
            int? configuredDayOfMonth,
            int fallbackDay
        )
        {
            if (!isRecurring)
            {
                return 1;
            }

            var normalizedInterval = recurrenceInterval?.Trim().ToLowerInvariant() ?? "monthly";

            if (normalizedInterval is "monthly" or "quarterly" or "yearly")
            {
                var cadenceMonths = normalizedInterval switch
                {
                    "quarterly" => 3,
                    "yearly" => 12,
                    _ => 1,
                };

                var targetYear = budgetDate.Year;
                var targetMonth = budgetDate.Month;
                var daysInMonth = DateTime.DaysInMonth(targetYear, targetMonth);
                var dayOfMonth = Math.Clamp(configuredDayOfMonth ?? fallbackDay, 1, daysInMonth);
                var occurrenceDate = new DateOnly(targetYear, targetMonth, dayOfMonth);

                var monthDelta = (targetYear - anchorDate.Year) * 12 + (targetMonth - anchorDate.Month);
                if (monthDelta < 0)
                {
                    return 0;
                }

                if (monthDelta % cadenceMonths != 0)
                {
                    return 0;
                }

                return occurrenceDate >= anchorDate ? 1 : 0;
            }

            var intervalDays = normalizedInterval switch
            {
                "weekly" => 7,
                "biweekly" => 14,
                _ => 0,
            };

            var year = budgetDate.Year;
            var month = budgetDate.Month;
            var monthStart = new DateOnly(year, month, 1);
            var daysInTargetMonth = DateTime.DaysInMonth(year, month);
            var monthEnd = new DateOnly(year, month, daysInTargetMonth);

            if (intervalDays == 0)
            {
                return 1;
            }

            var nextOccurrence = anchorDate;
            if (nextOccurrence < monthStart)
            {
                var daysDiff = monthStart.DayNumber - nextOccurrence.DayNumber;
                var intervalsToAdvance = (daysDiff + intervalDays - 1) / intervalDays;
                nextOccurrence = nextOccurrence.AddDays(intervalsToAdvance * intervalDays);
            }

            var occurrences = 0;

            while (nextOccurrence <= monthEnd)
            {
                occurrences++;
                nextOccurrence = nextOccurrence.AddDays(intervalDays);
            }

            return occurrences;
        }

        private void GenerateRecurringRowsForBudget(string userId, Domain.Budget budget)
        {
            var monthStart = new DateOnly(budget.Date.Year, budget.Date.Month, 1);
            var monthEnd = new DateOnly(budget.Date.Year, budget.Date.Month, DateTime.DaysInMonth(budget.Date.Year, budget.Date.Month));

            var incomeTemplates = db.RecurringIncomeTemplates
                .Where(template => template.UserId == userId)
                .Where(template => template.IsActive)
                .Where(template => template.StartDate <= monthEnd && (!template.StopDate.HasValue || template.StopDate.Value >= monthStart))
                .ToList();

            foreach (var template in incomeTemplates)
            {
                var occurrences = GetTemplateOccurrencesForMonth(template, monthStart, monthEnd);
                foreach (var occurrence in occurrences)
                {
                    var existingIncome = db.Incomes.FirstOrDefault(income =>
                        income.UserId == userId
                        && income.BudgetId == budget.Id
                        && income.SourceType == "recurring-template"
                        && income.SourceTemplateId == template.Id
                        && income.SourceOccurrenceDate == occurrence);

                    if (existingIncome is null)
                    {
                        db.Incomes.Add(new Income
                        {
                            UserId = userId,
                            BudgetId = budget.Id,
                            Name = template.Name,
                            Amount = template.Amount,
                            Date = occurrence,
                            IsRecurring = false,
                            RecurrenceInterval = "none",
                            PaydayDayOfMonth = null,
                            SourceType = "recurring-template",
                            SourceTemplateId = template.Id,
                            SourceOccurrenceDate = occurrence,
                            GenerationMonth = monthStart,
                        });
                    }
                    else
                    {
                        existingIncome.Name = template.Name;
                        existingIncome.Amount = template.Amount;
                        existingIncome.Date = occurrence;
                        existingIncome.IsRecurring = false;
                        existingIncome.RecurrenceInterval = "none";
                        existingIncome.PaydayDayOfMonth = null;
                        existingIncome.SourceType = "recurring-template";
                        existingIncome.SourceTemplateId = template.Id;
                        existingIncome.SourceOccurrenceDate = occurrence;
                        existingIncome.GenerationMonth = monthStart;
                        db.Incomes.Update(existingIncome);
                    }
                }
            }

            var categoryTemplates = db.RecurringCategoryTemplates
                .Where(template => template.UserId == userId)
                .Where(template => template.IsActive)
                .Where(template => template.StartDate <= monthEnd && (!template.StopDate.HasValue || template.StopDate.Value >= monthStart))
                .ToList();

            foreach (var template in categoryTemplates)
            {
                var existingCategory = db.Categories.FirstOrDefault(category =>
                    category.UserId == userId
                    && category.BudgetId == budget.Id
                    && category.SourceType == "recurring-template"
                    && category.SourceTemplateId == template.Id);

                if (existingCategory is null)
                {
                    db.Categories.Add(new Category
                    {
                        UserId = userId,
                        BudgetId = budget.Id,
                        Name = template.Name,
                        Allocation = template.Allocation,
                        CurrentSpend = 0,
                        SourceType = "recurring-template",
                        SourceTemplateId = template.Id,
                        GenerationMonth = monthStart,
                    });
                }
                else
                {
                    existingCategory.Name = template.Name;
                    existingCategory.Allocation = template.Allocation;
                    existingCategory.SourceType = "recurring-template";
                    existingCategory.SourceTemplateId = template.Id;
                    existingCategory.GenerationMonth = monthStart;
                    db.Categories.Update(existingCategory);
                }
            }

            db.SaveChanges();
        }

        private static List<DateOnly> GetTemplateOccurrencesForMonth(RecurringIncomeTemplate template, DateOnly monthStart, DateOnly monthEnd)
        {
            var scheduleType = template.ScheduleType?.Trim().ToLowerInvariant() ?? "monthly";
            var occurrences = new List<DateOnly>();

            // Weekly and biweekly schedules are anchored to a specific payday cadence.
            // Use the earlier of anchor/start dates so an anchor within the month is not
            // accidentally skipped when start date is set later.
            var effectiveStartDate = scheduleType is "weekly" or "biweekly"
                ? (template.StartDate < template.AnchorDate ? template.StartDate : template.AnchorDate)
                : template.StartDate;

            if (scheduleType is "weekly" or "biweekly")
            {
                var stepDays = scheduleType == "weekly" ? 7 : 14;
                var next = template.AnchorDate;

                if (next < monthStart)
                {
                    var daysDiff = monthStart.DayNumber - next.DayNumber;
                    var intervalsToAdvance = (daysDiff + stepDays - 1) / stepDays;
                    next = next.AddDays(intervalsToAdvance * stepDays);
                }

                while (next <= monthEnd)
                {
                    if (next >= effectiveStartDate && (!template.StopDate.HasValue || next <= template.StopDate.Value))
                    {
                        occurrences.Add(next);
                    }

                    next = next.AddDays(stepDays);
                }

                return occurrences;
            }

            if (scheduleType == "semimonthly")
            {
                var dayCandidates = new[] { template.SemiMonthlyDay1, template.SemiMonthlyDay2 }
                    .Where(day => day.HasValue)
                    .Select(day => Math.Clamp(day!.Value, 1, DateTime.DaysInMonth(monthStart.Year, monthStart.Month)))
                    .Distinct()
                    .OrderBy(day => day)
                    .ToList();

                foreach (var day in dayCandidates)
                {
                    var occurrence = new DateOnly(monthStart.Year, monthStart.Month, day);
                    if (occurrence >= effectiveStartDate && (!template.StopDate.HasValue || occurrence <= template.StopDate.Value))
                    {
                        occurrences.Add(occurrence);
                    }
                }

                return occurrences;
            }

            var monthDay = template.MonthlyDayOfMonth ?? template.AnchorDate.Day;
            var normalizedDay = Math.Clamp(monthDay, 1, DateTime.DaysInMonth(monthStart.Year, monthStart.Month));
            var monthlyOccurrence = new DateOnly(monthStart.Year, monthStart.Month, normalizedDay);

            if (monthlyOccurrence >= effectiveStartDate && (!template.StopDate.HasValue || monthlyOccurrence <= template.StopDate.Value))
            {
                occurrences.Add(monthlyOccurrence);
            }

            return occurrences;
        }

        private void RecalculateBudgetTotals(string userId, Domain.Budget budget)
        {
            var incomes = db.Incomes
                .Where(income => income.UserId == userId && income.BudgetId == budget.Id)
                .Select(income => income.Amount)
                .ToList();

            var categories = db.Categories
                .Where(category => category.UserId == userId && category.BudgetId == budget.Id)
                .Select(category => category.Allocation)
                .ToList();

            budget.MonthlyIncome = incomes.Sum();
            budget.MonthlyExpenses = categories.Sum();
            db.Budgets.Update(budget);
            db.SaveChanges();
        }

        /// <summary>
        /// Deletes all template-generated rows for a given month and re-runs generation from active templates.
        /// Returns the refreshed budget, or null if the budget does not exist for the given month.
        /// </summary>
        public BudgetResponse? RegenerateMonth(string userId, int year, int month)
        {
            try
            {
                var budget = db.Budgets
                    .Where(b => b.UserId == userId && b.Date.Year == year && b.Date.Month == month)
                    .FirstOrDefault();

                if (budget is null)
                {
                    return null;
                }

                // Remove stale template-sourced income rows
                var staleIncomes = db.Incomes
                    .Where(i => i.UserId == userId && i.BudgetId == budget.Id && i.SourceType == "recurring-template")
                    .ToList();
                db.Incomes.RemoveRange(staleIncomes);

                // Remove stale template-sourced category rows
                var staleCategories = db.Categories
                    .Where(c => c.UserId == userId && c.BudgetId == budget.Id && c.SourceType == "recurring-template")
                    .ToList();
                db.Categories.RemoveRange(staleCategories);

                db.SaveChanges();

                GenerateRecurringRowsForBudget(userId, budget);
                RecalculateBudgetTotals(userId, budget);

                return new BudgetResponse
                {
                    Id = budget.Id,
                    UserId = budget.UserId,
                    MonthlyIncome = budget.MonthlyIncome,
                    MonthlyExpenses = budget.MonthlyExpenses,
                    Date = budget.Date,
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to regenerate month {Year}-{Month} for user {UserId}", year, month, userId);
                return null;
            }
        }
    }
}
