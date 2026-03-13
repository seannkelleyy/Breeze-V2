namespace Breeze.Api.Planner.RequestResponseObjects
{
    public class PlannerRequest
    {
        public decimal DesiredInvestmentAmount { get; set; }
        public decimal MonthlyExpenses { get; set; }
        public decimal InflationRate { get; set; }
        public decimal SafeWithdrawalRate { get; set; }
        public List<PlannerPersonRequest> People { get; set; } = new();
        public List<PlannerAccountRequest> Accounts { get; set; } = new();
    }
}
