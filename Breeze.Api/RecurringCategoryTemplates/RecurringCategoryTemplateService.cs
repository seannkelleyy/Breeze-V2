using Breeze.Api.RecurringCategoryTemplates.RequestResponseObjects;
using Breeze.Data;
using Breeze.Domain;

namespace Breeze.Api.RecurringCategoryTemplates
{
    public class RecurringCategoryTemplateService
    {
        private readonly ILogger _logger;
        private readonly BreezeContext db;

        public RecurringCategoryTemplateService(IConfiguration config, BreezeContext dbContext, ILogger logger)
        {
            _logger = logger;
            db = dbContext;
        }

        public List<RecurringCategoryTemplateResponse> GetTemplates(string userId)
        {
            return db.RecurringCategoryTemplates
                .Where(template => template.UserId == userId)
                .OrderBy(template => template.Name)
                .Select(ToResponse)
                .ToList();
        }

        public RecurringCategoryTemplateResponse? CreateTemplate(string userId, RecurringCategoryTemplateRequest request)
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
                var template = new RecurringCategoryTemplate
                {
                    UserId = userId,
                    Name = request.Name.Trim(),
                    Allocation = request.Allocation,
                    StartDate = request.StartDate,
                    StopDate = request.StopDate,
                    IsActive = request.IsActive,
                    CreatedAtUtc = nowUtc,
                    UpdatedAtUtc = nowUtc,
                };

                db.RecurringCategoryTemplates.Add(template);
                db.SaveChanges();
                return ToResponse(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }

        public RecurringCategoryTemplateResponse? UpdateTemplate(string userId, int id, RecurringCategoryTemplateRequest request)
        {
            try
            {
                var validationError = ValidateRequest(request);
                if (validationError is not null)
                {
                    _logger.LogWarning(validationError);
                    return null;
                }

                var template = db.RecurringCategoryTemplates.FirstOrDefault(item => item.Id == id && item.UserId == userId);
                if (template is null)
                {
                    return null;
                }

                template.Name = request.Name.Trim();
                template.Allocation = request.Allocation;
                template.StartDate = request.StartDate;
                template.StopDate = request.StopDate;
                template.IsActive = request.IsActive;
                template.UpdatedAtUtc = DateTime.UtcNow;

                db.RecurringCategoryTemplates.Update(template);
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
                var template = db.RecurringCategoryTemplates.FirstOrDefault(item => item.Id == id && item.UserId == userId);
                if (template is null)
                {
                    return false;
                }

                db.RecurringCategoryTemplates.Remove(template);
                db.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return false;
            }
        }

        private static RecurringCategoryTemplateResponse ToResponse(RecurringCategoryTemplate template)
        {
            return new RecurringCategoryTemplateResponse
            {
                Id = template.Id,
                UserId = template.UserId,
                Name = template.Name,
                Allocation = template.Allocation,
                StartDate = template.StartDate,
                StopDate = template.StopDate,
                IsActive = template.IsActive,
            };
        }

        private static string? ValidateRequest(RecurringCategoryTemplateRequest request)
        {
            if (request.Allocation < 0)
            {
                return "Recurring category allocation cannot be negative.";
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return "Recurring category name is required.";
            }

            if (request.StopDate.HasValue && request.StopDate.Value < request.StartDate)
            {
                return "Recurring category stop date must be on or after start date.";
            }

            return null;
        }
    }
}
