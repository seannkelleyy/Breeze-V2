namespace Breeze.Api.Planner.RequestResponseObjects
{
    public class PlannerPersonRequest
    {
        public string PersonType { get; set; }
        public string Name { get; set; }
        public DateTime Birthday { get; set; }
        public int RetirementAge { get; set; }
        public decimal AnnualSalary { get; set; }
        public string BonusMode { get; set; }
        public decimal AnnualBonus { get; set; }
        public decimal IncomeGrowthRate { get; set; }
    }
}
