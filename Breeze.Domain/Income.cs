namespace Breeze.Domain
{
    public class Income
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int BudgetId { get; set; }
        public string Name { get; set; }
        public decimal Amount { get; set; }
        public DateOnly Date { get; set; }
        public bool IsRecurring { get; set; }
        public string RecurrenceInterval { get; set; } = "none";
        public int? PaydayDayOfMonth { get; set; }
        public string SourceType { get; set; } = "manual";
        public int? SourceTemplateId { get; set; }
        public DateOnly? SourceOccurrenceDate { get; set; }
        public DateOnly? GenerationMonth { get; set; }
    }
}
