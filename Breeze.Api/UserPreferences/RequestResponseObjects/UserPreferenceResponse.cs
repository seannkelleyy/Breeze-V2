namespace Breeze.Api.UserPreferences.RequestResponseObjects
{
    public class UserPreferenceResponse
    {
        public string UserId { get; set; }
        public string CurrencyCode { get; set; }
        public string ReturnDisplayMode { get; set; }
        public decimal InflationRate { get; set; }
        public decimal SafeWithdrawalRate { get; set; }
    }
}
