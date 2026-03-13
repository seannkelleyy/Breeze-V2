using Breeze.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Breeze.Data
{
    internal class PlannerProfileConfiguration : IEntityTypeConfiguration<PlannerProfile>
    {
        public void Configure(EntityTypeBuilder<PlannerProfile> modelBuilder)
        {
            modelBuilder.ToTable("PlannerProfile");
        }
    }
}
