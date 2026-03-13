using Breeze.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Breeze.Data
{
    internal class IRSAccountConfiguration : IEntityTypeConfiguration<IRSAccount>
    {
        public void Configure(EntityTypeBuilder<IRSAccount> modelBuilder)
        {
            modelBuilder.ToTable("IRSAccount");
        }
    }
}
