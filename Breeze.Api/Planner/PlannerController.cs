using Breeze.Api.Planner.RequestResponseObjects;
using Breeze.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Breeze.Api.Planner
{
    [Authorize]
    [ApiController]
    [Route("/planner")]
    public class PlannerController : ControllerBase
    {
        private readonly PlannerService planner;
        private readonly ILogger<PlannerController> _logger;

        public PlannerController(IConfiguration config, ILogger<PlannerController> logger, BreezeContext breezeContext)
        {
            planner = new PlannerService(config, breezeContext, logger);
            _logger = logger;
        }

        [HttpGet]
        public IActionResult GetPlanner()
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                return Ok(planner.GetPlannerByUserId(userId));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get planner");
                return BadRequest("Something went wrong.");
            }
        }

        [HttpGet("latest-budget-expenses")]
        public IActionResult GetLatestBudgetExpenses()
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                return Ok(planner.GetLatestBudgetMonthlyExpenses(userId));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get latest budget expenses for planner");
                return BadRequest("Something went wrong.");
            }
        }

        [HttpPut]
        public IActionResult PutPlanner([FromBody] PlannerRequest plannerRequest)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                var response = planner.UpsertPlanner(userId, plannerRequest);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upsert planner");
                return BadRequest("Something went wrong.");
            }
        }

    }
}
