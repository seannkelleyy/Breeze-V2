using Breeze.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Breeze.Data
{
    internal class IncomeConfiguration : IEntityTypeConfiguration<Income>
    {
        public void Configure(EntityTypeBuilder<Income> modelBuilder)
        {
            modelBuilder.ToTable("Income");
            modelBuilder
                .Property(i => i.Amount)
                .HasColumnType("decimal(18, 2)");
            modelBuilder
                .Property(i => i.Amount)
                .HasPrecision(18, 2);
            modelBuilder
                .Property(i => i.SourceType)
                .HasMaxLength(30)
                .HasDefaultValue("manual");
            modelBuilder.HasIndex(i => new { i.UserId, i.BudgetId, i.SourceTemplateId, i.SourceOccurrenceDate });
        }
    }
}
