namespace Breeze.Api.RecurringCategoryTemplates.RequestResponseObjects
{
    public class RecurringCategoryTemplateRequest
    {
        public int? Id { get; set; }
        public string Name { get; set; }
        public decimal Allocation { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly? StopDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
