using System.IdentityModel.Tokens.Jwt;
using Breeze.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

JsonWebTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://apt-monkfish-71.clerk.accounts.dev";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "https://apt-monkfish-71.clerk.accounts.dev",
            ValidateAudience = false, // Set to true if you're using custom audience
            ValidateLifetime = true,
            NameClaimType = "sub" // This is Clerk's user ID
        };
    });



builder.Services.AddAuthorization();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Breeze API", Version = "v1" });

    // Add security definition
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
{
    {
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        },
        new string[] {}
    }
    });
});

var applicationInsightsConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
var applicationInsightsInstrumentationKey = builder.Configuration["ApplicationInsights:InstrumentationKey"];

if (string.IsNullOrWhiteSpace(applicationInsightsConnectionString) && !string.IsNullOrWhiteSpace(applicationInsightsInstrumentationKey))
{
    applicationInsightsConnectionString = $"InstrumentationKey={applicationInsightsInstrumentationKey}";
}

if (!string.IsNullOrWhiteSpace(applicationInsightsConnectionString))
{
    builder.Services.AddApplicationInsightsTelemetry(options =>
    {
        options.ConnectionString = applicationInsightsConnectionString;
    });
}

// Establish connection string
builder.Services.AddDbContext<BreezeContext>(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.UseNpgsql(builder.Configuration.GetConnectionString("breezeDb-local"));
    }
    else
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("breezeDb"));
    }
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("localhost", policy =>
    {
        policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:5173");
    });
    options.AddPolicy("production", policy =>
    {
        policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("https://www.breeze.seannkelleyy.com");
        policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:5173");
    });
});

builder.Services.AddControllers();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<BreezeContext>();
    db.Database.EnsureCreated();

    if (db.Database.IsNpgsql())
    {
        db.Database.ExecuteSqlRaw(@"
ALTER TABLE IF EXISTS ""PlannerPerson""
    ADD COLUMN IF NOT EXISTS ""BonusMode"" text NOT NULL DEFAULT 'dollars',
    ADD COLUMN IF NOT EXISTS ""AnnualBonus"" numeric(18,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ""IncomeGrowthRate"" numeric(9,4) NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS ""PlannerAccount""
    ADD COLUMN IF NOT EXISTS ""PurchaseDate"" timestamp with time zone NULL,
    ADD COLUMN IF NOT EXISTS ""PurchasePrice"" numeric(18,2) NULL,
    ADD COLUMN IF NOT EXISTS ""CurrentValue"" numeric(18,2) NULL,
    ADD COLUMN IF NOT EXISTS ""AnnualChangeRate"" numeric(9,4) NULL,
    ADD COLUMN IF NOT EXISTS ""HomeGrowthProfile"" text NULL,
    ADD COLUMN IF NOT EXISTS ""VehicleDepreciationProfile"" text NULL,
    ADD COLUMN IF NOT EXISTS ""HasLoan"" boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS ""LoanInterestRate"" numeric(9,4) NULL,
    ADD COLUMN IF NOT EXISTS ""OriginalLoanAmount"" numeric(18,2) NULL,
    ADD COLUMN IF NOT EXISTS ""LoanMonthlyPayment"" numeric(18,2) NULL,
    ADD COLUMN IF NOT EXISTS ""LoanTermYears"" integer NULL,
    ADD COLUMN IF NOT EXISTS ""LoanStartDate"" timestamp with time zone NULL,
    ADD COLUMN IF NOT EXISTS ""CurrentLoanBalance"" numeric(18,2) NULL;

UPDATE ""PlannerPerson""
SET ""BonusMode"" = 'dollars'
WHERE ""BonusMode"" IS NULL OR BTRIM(""BonusMode"") = '';
");
    }

    if (!db.IRSAccounts.Any())
    {
        db.IRSAccounts.AddRange(
            new Breeze.Domain.IRSAccount { Type = "401k", MaxAmount = 24500m, FamilyMaxAmount = null, CatchUpAmount = 8000m, CatchUpAge = 50 },
            new Breeze.Domain.IRSAccount { Type = "Roth IRA", MaxAmount = 7500m, FamilyMaxAmount = null, CatchUpAmount = 1100m, CatchUpAge = 50 },
            new Breeze.Domain.IRSAccount { Type = "Traditional IRA", MaxAmount = 7500m, FamilyMaxAmount = null, CatchUpAmount = 1100m, CatchUpAge = 50 },
            new Breeze.Domain.IRSAccount { Type = "HSA", MaxAmount = 4400m, FamilyMaxAmount = 8750m, CatchUpAmount = 1000m, CatchUpAge = 55 }
        );
        db.SaveChanges();
    }
}

app.UseSwagger();
app.UseSwaggerUI();

if (app.Environment.IsDevelopment())
{
    app.UseCors("localhost");
}
else
{
    app.UseCors("production");
}

builder.Services.AddLogging(options =>
{
    options.AddConsole();
    options.AddDebug();
});


app.UseHttpsRedirection();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapControllers();

app.Run();
