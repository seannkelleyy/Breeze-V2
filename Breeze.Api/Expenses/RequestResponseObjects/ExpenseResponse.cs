namespace Breeze.Api.Expenses.RequestResponseObjects
{
    public class ExpenseResponse
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public int CategoryId { get; set; }
        public decimal Amount { get; set; }
        public DateOnly Date { get; set; }
        public bool IsRecurring { get; set; }
        public string RecurrenceInterval { get; set; }
        public int? DueDayOfMonth { get; set; }
    }
}
