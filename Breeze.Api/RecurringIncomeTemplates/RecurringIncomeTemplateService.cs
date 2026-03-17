using Breeze.Api.RecurringIncomeTemplates.RequestResponseObjects;
using Breeze.Data;
using Breeze.Domain;

namespace Breeze.Api.RecurringIncomeTemplates
{
    public class RecurringIncomeTemplateService
    {
        private readonly ILogger _logger;
        private readonly BreezeContext db;

        public RecurringIncomeTemplateService(IConfiguration config, BreezeContext dbContext, ILogger logger)
        {
            _logger = logger;
            db = dbContext;
        }

        public List<RecurringIncomeTemplateResponse> GetTemplates(string userId)
        {
            return db.RecurringIncomeTemplates
                .Where(template => template.UserId == userId)
                .OrderBy(template => template.Name)
                .Select(ToResponse)
                .ToList();
        }

        public RecurringIncomeTemplateResponse? CreateTemplate(string userId, RecurringIncomeTemplateRequest request)
        {
            try
            {
                var validationError = ValidateRequest(request);
                if (validationError is not null)
                {
                    _logger.LogWarning(validationError);
                    return null;
                }

                var nowUtc = DateTime.UtcNow;
                var template = new RecurringIncomeTemplate
                {
                    UserId = userId,
                    Name = request.Name.Trim(),
                    Amount = request.Amount,
                    ScheduleType = NormalizeScheduleType(request.ScheduleType),
                    AnchorDate = request.AnchorDate,
                    SemiMonthlyDay1 = NormalizeDay(request.SemiMonthlyDay1),
                    SemiMonthlyDay2 = NormalizeDay(request.SemiMonthlyDay2),
                    MonthlyDayOfMonth = NormalizeDay(request.MonthlyDayOfMonth),
                    StartDate = request.StartDate,
                    StopDate = request.StopDate,
                    IsActive = request.IsActive,
                    CreatedAtUtc = nowUtc,
                    UpdatedAtUtc = nowUtc,
                };

                db.RecurringIncomeTemplates.Add(template);
                db.SaveChanges();
                return ToResponse(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }

        public RecurringIncomeTemplateResponse? UpdateTemplate(string userId, int id, RecurringIncomeTemplateRequest request)
        {
            try
            {
                var validationError = ValidateRequest(request);
                if (validationError is not null)
                {
                    _logger.LogWarning(validationError);
                    return null;
                }

                var template = db.RecurringIncomeTemplates.FirstOrDefault(item => item.Id == id && item.UserId == userId);
                if (template is null)
                {
                    return null;
                }

                template.Name = request.Name.Trim();
                template.Amount = request.Amount;
                template.ScheduleType = NormalizeScheduleType(request.ScheduleType);
                template.AnchorDate = request.AnchorDate;
                template.SemiMonthlyDay1 = NormalizeDay(request.SemiMonthlyDay1);
                template.SemiMonthlyDay2 = NormalizeDay(request.SemiMonthlyDay2);
                template.MonthlyDayOfMonth = NormalizeDay(request.MonthlyDayOfMonth);
                template.StartDate = request.StartDate;
                template.StopDate = request.StopDate;
                template.IsActive = request.IsActive;
                template.UpdatedAtUtc = DateTime.UtcNow;

                db.RecurringIncomeTemplates.Update(template);
                db.SaveChanges();
                return ToResponse(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }

        public bool DeleteTemplate(string userId, int id)
        {
            try
            {
                var template = db.RecurringIncomeTemplates.FirstOrDefault(item => item.Id == id && item.UserId == userId);
                if (template is null)
                {
                    return false;
                }

                db.RecurringIncomeTemplates.Remove(template);
                db.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return false;
            }
        }

        private static RecurringIncomeTemplateResponse ToResponse(RecurringIncomeTemplate template)
        {
            return new RecurringIncomeTemplateResponse
            {
                Id = template.Id,
                UserId = template.UserId,
                Name = template.Name,
                Amount = template.Amount,
                ScheduleType = template.ScheduleType,
                AnchorDate = template.AnchorDate,
                SemiMonthlyDay1 = template.SemiMonthlyDay1,
                SemiMonthlyDay2 = template.SemiMonthlyDay2,
                MonthlyDayOfMonth = template.MonthlyDayOfMonth,
                StartDate = template.StartDate,
                StopDate = template.StopDate,
                IsActive = template.IsActive,
            };
        }

        private static string? ValidateRequest(RecurringIncomeTemplateRequest request)
        {
            if (request.Amount <= 0)
            {
                return "Recurring income amount must be greater than zero.";
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return "Recurring income name is required.";
            }

            if (request.StopDate.HasValue && request.StopDate.Value < request.StartDate)
            {
                return "Recurring income stop date must be on or after start date.";
            }

            var scheduleType = NormalizeScheduleType(request.ScheduleType);
            if (scheduleType == "semimonthly")
            {
                if (!request.SemiMonthlyDay1.HasValue || !request.SemiMonthlyDay2.HasValue)
                {
                    return "Semimonthly schedules require two days of month.";
                }

                if (request.SemiMonthlyDay1.Value == request.SemiMonthlyDay2.Value)
                {
                    return "Semimonthly schedule days must be different.";
                }
            }

            if (scheduleType == "monthly" && request.MonthlyDayOfMonth.HasValue)
            {
                if (request.MonthlyDayOfMonth.Value < 1 || request.MonthlyDayOfMonth.Value > 31)
                {
                    return "Monthly day must be between 1 and 31.";
                }
            }

            return null;
        }

        private static int? NormalizeDay(int? day)
        {
            if (!day.HasValue)
            {
                return null;
            }

            return Math.Clamp(day.Value, 1, 31);
        }

        private static string NormalizeScheduleType(string? scheduleType)
        {
            var normalized = scheduleType?.Trim().ToLowerInvariant();
            return normalized is "weekly" or "biweekly" or "semimonthly" or "monthly"
                ? normalized
                : "monthly";
        }
    }
}
