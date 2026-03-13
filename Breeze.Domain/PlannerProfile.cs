namespace Breeze.Domain
{
    public class PlannerProfile
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public decimal DesiredInvestmentAmount { get; set; }
        public decimal MonthlyExpenses { get; set; }
        public decimal InflationRate { get; set; }
        public decimal SafeWithdrawalRate { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime UpdatedAtUtc { get; set; }
    }
}
