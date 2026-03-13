namespace Breeze.Api.IRSAccounts.RequestResponseObjects
{
    public class IRSAccountResponse
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public decimal MaxAmount { get; set; }
        public decimal? FamilyMaxAmount { get; set; }
        public decimal CatchUpAmount { get; set; }
        public int CatchUpAge { get; set; }
    }
}
