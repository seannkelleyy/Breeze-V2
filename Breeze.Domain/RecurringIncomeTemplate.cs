namespace Breeze.Domain
{
    public class RecurringIncomeTemplate
    {
        public int Id { get; set; }
        public string UserId { get; set; }
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
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
