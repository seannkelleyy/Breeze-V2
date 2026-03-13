using Breeze.Api.IRSAccounts.RequestResponseObjects;
using Breeze.Data;
using Breeze.Domain;

namespace Breeze.Api.IRSAccounts
{
    public class IRSAccountService
    {
        private readonly ILogger _logger;
        private readonly BreezeContext db;

        public IRSAccountService(IConfiguration config, BreezeContext dbContext, ILogger logger)
        {
            _logger = logger;
            db = dbContext;
        }

        public IRSAccountResponse? GetIRSAccountById(int id)
        {
            try
            {
                return db.IRSAccounts
                    .Where(account => account.Id.Equals(id))
                    .Select(account => new IRSAccountResponse
                    {
                        Id = account.Id,
                        Type = account.Type,
                        MaxAmount = account.MaxAmount,
                        FamilyMaxAmount = account.FamilyMaxAmount,
                        CatchUpAmount = account.CatchUpAmount,
                        CatchUpAge = account.CatchUpAge,
                    })
                    .First();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }

        public List<IRSAccountResponse>? GetIRSAccounts()
        {
            try
            {
                return db.IRSAccounts
                    .Select(account => new IRSAccountResponse
                    {
                        Id = account.Id,
                        Type = account.Type,
                        MaxAmount = account.MaxAmount,
                        FamilyMaxAmount = account.FamilyMaxAmount,
                        CatchUpAmount = account.CatchUpAmount,
                        CatchUpAge = account.CatchUpAge,
                    })
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }

        public int CreateIRSAccount(IRSAccountRequest newIRSAccount)
        {
            try
            {
                IRSAccount account = new IRSAccount
                {
                    Type = newIRSAccount.Type,
                    MaxAmount = newIRSAccount.MaxAmount,
                    FamilyMaxAmount = newIRSAccount.FamilyMaxAmount,
                    CatchUpAmount = newIRSAccount.CatchUpAmount,
                    CatchUpAge = newIRSAccount.CatchUpAge,
                };

                db.IRSAccounts.Add(account);
                db.SaveChanges();
                return account.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return -5;
            }
        }

        public int UpdateIRSAccount(IRSAccountRequest updatedIRSAccount)
        {
            try
            {
                var account = db.IRSAccounts.Find(updatedIRSAccount.Id);
                if (account is null)
                {
                    return -2;
                }

                account.Type = updatedIRSAccount.Type;
                account.MaxAmount = updatedIRSAccount.MaxAmount;
                account.FamilyMaxAmount = updatedIRSAccount.FamilyMaxAmount;
                account.CatchUpAmount = updatedIRSAccount.CatchUpAmount;
                account.CatchUpAge = updatedIRSAccount.CatchUpAge;

                db.IRSAccounts.Update(account);
                db.SaveChanges();
                return account.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return -5;
            }
        }

        public int DeleteIRSAccountById(int id)
        {
            try
            {
                var account = db.IRSAccounts.Find(id);
                if (account is null)
                {
                    return -2;
                }

                db.IRSAccounts.Remove(account);
                db.SaveChanges();
                return id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return -5;
            }
        }
    }
}
