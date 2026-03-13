namespace Breeze.Api.Planner.RequestResponseObjects
{
    public class PlannerAccountResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Owner { get; set; }
        public string AccountType { get; set; }
        public string ContributionMode { get; set; }
        public decimal ContributionValue { get; set; }
        public decimal EmployerMatchRate { get; set; }
        public decimal EmployerMatchMaxPercentOfSalary { get; set; }
        public decimal StartingBalance { get; set; }
        public decimal AnnualRate { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public decimal? PurchasePrice { get; set; }
        public decimal? CurrentValue { get; set; }
        public decimal? AnnualChangeRate { get; set; }
        public string? HomeGrowthProfile { get; set; }
        public string? VehicleDepreciationProfile { get; set; }
        public bool HasLoan { get; set; }
        public decimal? LoanInterestRate { get; set; }
        public decimal? OriginalLoanAmount { get; set; }
        public decimal? LoanMonthlyPayment { get; set; }
        public int? LoanTermYears { get; set; }
        public DateTime? LoanStartDate { get; set; }
        public decimal? CurrentLoanBalance { get; set; }
    }
}
