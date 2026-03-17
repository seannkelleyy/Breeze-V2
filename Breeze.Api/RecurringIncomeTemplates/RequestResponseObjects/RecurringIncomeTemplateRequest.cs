namespace Breeze.Api.RecurringIncomeTemplates.RequestResponseObjects
{
    public class RecurringIncomeTemplateRequest
    {
        public int? Id { get; set; }
        public string Name { get; set; }
        public decimal Amount { get; set; }
        public string ScheduleType { get; set; }
        public DateOnly AnchorDate { get; set; }
        public int? SemiMonthlyDay1 { get; set; }
        public int? SemiMonthlyDay2 { get; set; }
        public int? MonthlyDayOfMonth { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly? StopDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
