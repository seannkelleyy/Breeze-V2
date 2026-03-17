using Breeze.Api.UserPreferences.RequestResponseObjects;
using Breeze.Data;
using Breeze.Domain;

namespace Breeze.Api.UserPreferences
{
    public class UserPreferenceService
    {
        private const string DefaultCurrencyCode = "USD";
        private const string DefaultReturnDisplayMode = "nominal";
        private const decimal DefaultInflationRate = 2.5m;
        private const decimal DefaultSafeWithdrawalRate = 4m;

        private readonly ILogger _logger;
        private readonly BreezeContext db;

        public UserPreferenceService(IConfiguration config, BreezeContext dbContext, ILogger logger)
        {
            _logger = logger;
            db = dbContext;
        }

        public UserPreferenceResponse? GetOrCreateByUserId(string userId)
        {
            try
            {
                var normalizedUserId = NormalizeUserId(userId);
                var preference = db.UserPreferences.FirstOrDefault(item => item.UserId == normalizedUserId);

                if (preference is null)
                {
                    preference = new UserPreference
                    {
                        UserId = normalizedUserId,
                        CurrencyCode = DefaultCurrencyCode,
                        ReturnDisplayMode = DefaultReturnDisplayMode,
                        InflationRate = DefaultInflationRate,
                        SafeWithdrawalRate = DefaultSafeWithdrawalRate,
                    };

                    db.UserPreferences.Add(preference);
                    db.SaveChanges();
                }

                return new UserPreferenceResponse
                {
                    UserId = preference.UserId,
                    CurrencyCode = preference.CurrencyCode,
                    ReturnDisplayMode = preference.ReturnDisplayMode,
                    InflationRate = preference.InflationRate,
                    SafeWithdrawalRate = preference.SafeWithdrawalRate,
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }

        public UserPreferenceResponse? UpsertByUserId(string userId, UserPreferenceRequest request)
        {
            try
            {
                var normalizedUserId = NormalizeUserId(userId);
                var normalizedCurrencyCode = NormalizeCurrencyCode(request.CurrencyCode);
                var normalizedReturnDisplayMode = NormalizeReturnDisplayMode(request.ReturnDisplayMode);
                var normalizedInflationRate = NormalizeRate(request.InflationRate, DefaultInflationRate);
                var normalizedSafeWithdrawalRate = NormalizeRate(request.SafeWithdrawalRate, DefaultSafeWithdrawalRate);

                var preference = db.UserPreferences.FirstOrDefault(item => item.UserId == normalizedUserId);
                if (preference is null)
                {
                    preference = new UserPreference
                    {
                        UserId = normalizedUserId,
                        CurrencyCode = normalizedCurrencyCode,
                        ReturnDisplayMode = normalizedReturnDisplayMode,
                        InflationRate = normalizedInflationRate,
                        SafeWithdrawalRate = normalizedSafeWithdrawalRate,
                    };

                    db.UserPreferences.Add(preference);
                }
                else
                {
                    preference.CurrencyCode = normalizedCurrencyCode;
                    preference.ReturnDisplayMode = normalizedReturnDisplayMode;
                    preference.InflationRate = normalizedInflationRate;
                    preference.SafeWithdrawalRate = normalizedSafeWithdrawalRate;
                    db.UserPreferences.Update(preference);
                }

                db.SaveChanges();

                return new UserPreferenceResponse
                {
                    UserId = preference.UserId,
                    CurrencyCode = preference.CurrencyCode,
                    ReturnDisplayMode = preference.ReturnDisplayMode,
                    InflationRate = preference.InflationRate,
                    SafeWithdrawalRate = preference.SafeWithdrawalRate,
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }

        private static string NormalizeUserId(string userId)
        {
            return userId.Trim();
        }

        private static string NormalizeCurrencyCode(string? currencyCode)
        {
            if (string.IsNullOrWhiteSpace(currencyCode))
            {
                return DefaultCurrencyCode;
            }

            return currencyCode.Trim().ToUpperInvariant();
        }

        private static string NormalizeReturnDisplayMode(string? returnDisplayMode)
        {
            return string.Equals(returnDisplayMode, "real", StringComparison.OrdinalIgnoreCase)
                ? "real"
                : DefaultReturnDisplayMode;
        }

        private static decimal NormalizeRate(decimal value, decimal fallback)
        {
            return value < 0 ? fallback : value;
        }
    }
}
