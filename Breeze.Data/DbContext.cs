using Breeze.Domain;
using Microsoft.EntityFrameworkCore;

namespace Breeze.Data
{
    public class BreezeContext : DbContext
    {
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Income> Incomes { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Budget> Budgets { get; set; }
        public DbSet<Goal> Goals { get; set; }
        public DbSet<IRSAccount> IRSAccounts { get; set; }
        public DbSet<PlannerProfile> PlannerProfiles { get; set; }
        public DbSet<PlannerPerson> PlannerPeople { get; set; }
        public DbSet<PlannerAccount> PlannerAccounts { get; set; }

        public BreezeContext(DbContextOptions<BreezeContext> options) : base
            (options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            if (Database.ProviderName?.Contains("SqlServer", StringComparison.OrdinalIgnoreCase) == true)
            {
                modelBuilder.HasDefaultSchema("dbo");
            }

            modelBuilder.ApplyConfiguration(new BudgetConfiguration());
            modelBuilder.ApplyConfiguration(new CategoryConfiguration());
            modelBuilder.ApplyConfiguration(new ExpenseConfiguration());
            modelBuilder.ApplyConfiguration(new IncomeConfiguration());
            modelBuilder.ApplyConfiguration(new GoalConfiguration());
            modelBuilder.ApplyConfiguration(new IRSAccountConfiguration());
            modelBuilder.ApplyConfiguration(new PlannerProfileConfiguration());
            modelBuilder.ApplyConfiguration(new PlannerPersonConfiguration());
            modelBuilder.ApplyConfiguration(new PlannerAccountConfiguration());
        }
    }
}
