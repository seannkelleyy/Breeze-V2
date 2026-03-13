using Breeze.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Breeze.Data
{
    internal class PlannerAccountConfiguration : IEntityTypeConfiguration<PlannerAccount>
    {
        public void Configure(EntityTypeBuilder<PlannerAccount> modelBuilder)
        {
            modelBuilder.ToTable("PlannerAccount");
        }
    }
}
