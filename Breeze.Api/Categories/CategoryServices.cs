using Breeze.Api.Budgets;
using Breeze.Api.Categories.RequestResponseObjects;
using Breeze.Api.Expenses.RequestResponseObjects;
using Breeze.Data;
using Breeze.Domain;

namespace Breeze.Api.Categories
{
    /// <summary>
    /// Service for managing categories.
    /// </summary>
    public class CategoryService
    {
        private readonly BudgetService budgets;
        private IConfiguration _config;
        private readonly ILogger _logger;
        private readonly BreezeContext db;

        /// <summary>
        /// Initializes a new instance of the <see cref="CategoryService"/> class.
        /// </summary>
        /// <param name="config">Configuration interface.</param>
        /// <param name="dbContext">Database context for Breeze.</param>
        /// <param name="logger">Logger for logging errors and information.</param>
        public CategoryService(IConfiguration config, BreezeContext dbContext, ILogger logger)
        {
            budgets = new BudgetService(config, dbContext, logger);
            _config = config;
            _logger = logger;
            db = dbContext;
        }

        /// <summary>
        /// Retrieves a category by its ID.
        /// </summary>
        /// <param name="userId">The user's identifier.</param>
        /// <param name="categoryId">The category's identifier.</param>
        /// <returns>A category response object or null if not found.</returns>
        public CategoryResponse? GetCategoryById(string userId, int categoryId)
        {
            try
            {
                return db.Categories
                    .Where(category => category.Id.Equals(categoryId) && category.UserId.Equals(userId))
                    .Select(category => new CategoryResponse
                    {
                        Id = category.Id,
                        UserId = category.UserId,
                        Name = category.Name,
                        Allocation = category.Allocation,
                        CurrentSpend = category.CurrentSpend,
                        BudgetId = category.BudgetId,
                        SourceType = category.SourceType,
                        SourceTemplateId = category.SourceTemplateId,
                        GenerationMonth = category.GenerationMonth,
                    })
                    .First();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }

        /// <summary>
        /// Retrieves categories using their budget ID.
        /// </summary>
        /// <param name="userId">The user's identifier.</param>
        /// <param name="categoryId">The category's identifier.</param>
        /// <returns>A category response object or null if not found.</returns>
        public List<CategoryResponse>? GetCategoriesByBudgetId(string userId, int budgetId)
        {
            try
            {
                return db.Categories
                    .Where(category => category.BudgetId.Equals(budgetId) && category.UserId.Equals(userId))
                    .Select(category => new CategoryResponse
                    {
                        Id = category.Id,
                        UserId = category.UserId,
                        Name = category.Name,
                        Allocation = category.Allocation,
                        CurrentSpend = category.CurrentSpend,
                        BudgetId = category.BudgetId,
                        SourceType = category.SourceType,
                        SourceTemplateId = category.SourceTemplateId,
                        GenerationMonth = category.GenerationMonth,
                    })
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }

        /// <summary>
        /// Creates a new category.
        /// </summary>
        /// <param name="userId">The user's identifier.</param>
        /// <param name="newCategory">The new category to create.</param>
        /// <returns>
        /// The ID of the created category, or one of the following error codes:
        /// -1: Cannot find foreign key dependency item.
        /// -5: Unknown error.
        /// </returns>
        public int CreateCategory(string userId, CategoryRequest newCategory)
        {
            try
            {
                var budget = db.Budgets.Where(budget => budget.Id.Equals(newCategory.BudgetId)).FirstOrDefault();
                if (budget is null)
                {
                    return -1;
                }
                Category category = new Category
                {
                    UserId = userId,
                    Name = newCategory.Name,
                    Allocation = newCategory.Allocation,
                    CurrentSpend = newCategory.CurrentSpend,
                    BudgetId = budget.Id,
                    SourceType = "manual",
                    SourceTemplateId = null,
                    GenerationMonth = null,
                };
                db.Categories.Add(category);
                db.SaveChanges();
                return category.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return -5;
            }
        }

        /// <summary>
        /// Updates an existing category.
        /// </summary>
        /// <param name="userId">The user's identifier.</param>
        /// <param name="updatedCategory">The updated category information.</param>
        /// <returns>
        /// The ID of the updated category or the following codes:
        /// -4 if the user doesn't match.
        /// -5 for an unknown error.
        /// </returns>
        public int UpdateCategory(string userId, CategoryRequest updatedCategory)
        {
            var category = db.Categories.Find(updatedCategory.Id);
            if (category is null)
            {
                return -2;
            }
            if (!category.UserId.Equals(userId))
            {
                return -4;
            }
            try
            {
                category.Name = updatedCategory.Name;
                category.Allocation = updatedCategory.Allocation;
                category.CurrentSpend = updatedCategory.CurrentSpend;
                category.SourceType = "manual";
                category.SourceTemplateId = null;
                category.GenerationMonth = null;
                db.Categories.Update(category);
                db.SaveChanges();
                return category.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return -5;
            }
        }

        /// <summary>
        /// Deletes a category by its ID.
        /// </summary>
        /// <param name="userId">The user's identifier.</param>
        /// <param name="categoryId">The category's identifier.</param>
        /// <returns>
        /// The ID of the deleted category, or one of the following error codes:
        /// -2: Cannot find item.
        /// -5: Unknown error.
        /// </returns>
        public int DeleteCategoryById(string userId, int categoryId)
        {
            try
            {
                var category = db.Categories.Find(categoryId);
                if (category is null)
                {
                    return -2;
                }
                if (!category.UserId.Equals(userId))
                {
                    return -4;
                }
                db.Categories.Remove(category);
                db.SaveChanges();
                return categoryId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return -5;
            }
        }

        /// <summary>
        /// Deletes all categories associated with a given budget.
        /// </summary>
        /// <param name="userId">The user's identifier.</param>
        /// <param name="budgetId">The budget's identifier.</param>
        /// <returns>
        /// The ID of the budget whose categories were deleted or the following codes:
        /// -2 if there is nothing to delete.
        /// -5 for an unknown error.
        /// </returns>
        public int DeleteCategoriesForBudget(string userId, int budgetId)
        {
            try
            {
                List<Category> categories = (List<Category>)db.Categories.Where(category => category.BudgetId.Equals(budgetId) && category.UserId.Equals(userId));
                if (categories is null || categories.Count().Equals(0))
                {
                    return -2;
                }
                db.Categories.RemoveRange(categories);
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
        /// Recalculates the amount spent for a specified category when adding an expense.
        /// </summary>
        /// <param name="userId">The user's identifier.</param>
        /// <param name="categoryId">The category's identifier to which expenses are added.</param>
        /// <param name="expenses">The list of expenses to add.</param>
        /// <returns>
        /// The ID of the category to which expenses were added, or one of the following error codes:
        /// -2: Cannot find the category.
        /// -4: User ID does not match.
        /// -5: Unknown error.
        /// </returns>
        public int CalculateCategoryExpenses(string userId, int categoryId, List<ExpenseResponse> expenses)
        {
            try
            {
                var existingCategory = db.Categories.Find(categoryId);
                if (existingCategory is null)
                {
                    return -2;
                }
                if (!existingCategory.UserId.Equals(userId))
                {
                    return -4;
                }

                var budget = db.Budgets.Find(existingCategory.BudgetId);
                if (budget is null)
                {
                    return -2;
                }

                var amountSpent = expenses.Sum(expense =>
                {
                    var occurrences = GetOccurrencesForMonth(
                        budget.Date,
                        expense.IsRecurring,
                        expense.RecurrenceInterval,
                        expense.Date,
                        expense.DueDayOfMonth,
                        expense.Date.Day
                    );
                    return expense.Amount * occurrences;
                });

                existingCategory.CurrentSpend = amountSpent;
                var categories = GetCategoriesByBudgetId(userId, existingCategory.BudgetId);
                if (categories == null)
                {
                    return -2;
                }
                budgets.CalculateBudgetCategories(userId, existingCategory.BudgetId, categories);
                db.SaveChanges();
                return existingCategory.Id;
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

                var year = budgetDate.Year;
                var month = budgetDate.Month;
                var daysInMonth = DateTime.DaysInMonth(year, month);
                var dayOfMonth = Math.Clamp(configuredDayOfMonth ?? fallbackDay, 1, daysInMonth);
                var occurrenceDate = new DateOnly(year, month, dayOfMonth);

                var monthDelta = (year - anchorDate.Year) * 12 + (month - anchorDate.Month);
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

            var budgetYear = budgetDate.Year;
            var budgetMonth = budgetDate.Month;
            var monthStart = new DateOnly(budgetYear, budgetMonth, 1);
            var daysInTargetMonth = DateTime.DaysInMonth(budgetYear, budgetMonth);
            var monthEnd = new DateOnly(budgetYear, budgetMonth, daysInTargetMonth);

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
    }
}
