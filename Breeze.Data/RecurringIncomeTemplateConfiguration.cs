using Breeze.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Breeze.Data
{
    internal class RecurringIncomeTemplateConfiguration : IEntityTypeConfiguration<RecurringIncomeTemplate>
    {
        public void Configure(EntityTypeBuilder<RecurringIncomeTemplate> modelBuilder)
        {
            modelBuilder.ToTable("RecurringIncomeTemplate");
            modelBuilder
                .Property(t => t.Amount)
                .HasColumnType("decimal(18, 2)")
                .HasPrecision(18, 2);
            modelBuilder
                .Property(t => t.ScheduleType)
                .HasMaxLength(30);
            modelBuilder
                .Property(t => t.Name)
                .HasMaxLength(100);
            modelBuilder
                .HasIndex(t => t.UserId);
        }
    }
}
