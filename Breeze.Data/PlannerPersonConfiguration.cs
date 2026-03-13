using Breeze.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Breeze.Data
{
    internal class PlannerPersonConfiguration : IEntityTypeConfiguration<PlannerPerson>
    {
        public void Configure(EntityTypeBuilder<PlannerPerson> modelBuilder)
        {
            modelBuilder.ToTable("PlannerPerson");
        }
    }
}
