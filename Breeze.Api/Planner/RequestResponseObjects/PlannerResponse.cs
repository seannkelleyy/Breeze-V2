namespace Breeze.Api.Planner.RequestResponseObjects
{
    public class PlannerResponse
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public decimal DesiredInvestmentAmount { get; set; }
        public decimal MonthlyExpenses { get; set; }
        public decimal InflationRate { get; set; }
        public decimal SafeWithdrawalRate { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime UpdatedAtUtc { get; set; }
        public List<PlannerPersonResponse> People { get; set; } = new();
        public List<PlannerAccountResponse> Accounts { get; set; } = new();
    }
}
