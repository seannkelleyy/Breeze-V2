using Breeze.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Breeze.Data
{
    internal class UserPreferenceConfiguration : IEntityTypeConfiguration<UserPreference>
    {
        public void Configure(EntityTypeBuilder<UserPreference> modelBuilder)
        {
            modelBuilder.ToTable("UserPreference");
            modelBuilder.HasKey(preference => preference.UserId);

            modelBuilder.Property(preference => preference.UserId)
                .HasMaxLength(50)
                .IsRequired();

            modelBuilder.Property(preference => preference.CurrencyCode)
                .HasMaxLength(3)
                .IsRequired();

            modelBuilder.Property(preference => preference.ReturnDisplayMode)
                .HasMaxLength(20)
                .IsRequired();

            modelBuilder.Property(preference => preference.InflationRate)
                .HasColumnType("decimal(9, 4)")
                .HasPrecision(9, 4)
                .IsRequired();

            modelBuilder.Property(preference => preference.SafeWithdrawalRate)
                .HasColumnType("decimal(9, 4)")
                .HasPrecision(9, 4)
                .IsRequired();
        }
    }
}
