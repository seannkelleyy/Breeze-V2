using Breeze.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Breeze.Data
{
    internal class RecurringCategoryTemplateConfiguration : IEntityTypeConfiguration<RecurringCategoryTemplate>
    {
        public void Configure(EntityTypeBuilder<RecurringCategoryTemplate> modelBuilder)
        {
            modelBuilder.ToTable("RecurringCategoryTemplate");
            modelBuilder
                .Property(t => t.Allocation)
                .HasColumnType("decimal(18, 2)")
                .HasPrecision(18, 2);
            modelBuilder
                .Property(t => t.Name)
                .HasMaxLength(200);
            modelBuilder
                .HasIndex(t => t.UserId);
        }
    }
}
