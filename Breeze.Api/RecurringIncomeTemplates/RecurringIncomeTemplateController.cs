using Breeze.Api.RecurringIncomeTemplates.RequestResponseObjects;
using Breeze.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Breeze.Api.RecurringIncomeTemplates
{
    [Authorize]
    [ApiController]
    [Route("/recurring-income-templates")]
    public class RecurringIncomeTemplateController : ControllerBase
    {
        private readonly RecurringIncomeTemplateService templates;
        private readonly ILogger<RecurringIncomeTemplateController> _logger;

        public RecurringIncomeTemplateController(IConfiguration config, ILogger<RecurringIncomeTemplateController> logger, BreezeContext breezeContext)
        {
            templates = new RecurringIncomeTemplateService(config, breezeContext, logger);
            _logger = logger;
        }

        [HttpGet]
        public IActionResult GetTemplates()
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                return Ok(templates.GetTemplates(userId));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get recurring income templates");
                return BadRequest("Something went wrong.");
            }
        }

        [HttpPost]
        public IActionResult PostTemplate([FromBody] RecurringIncomeTemplateRequest request)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                var template = templates.CreateTemplate(userId, request);
                if (template is null)
                {
                    return BadRequest("Failed to create recurring income template.");
                }

                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create recurring income template");
                return BadRequest("Something went wrong.");
            }
        }

        [HttpPatch("{id:int}")]
        public IActionResult PatchTemplate([FromRoute] int id, [FromBody] RecurringIncomeTemplateRequest request)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                var template = templates.UpdateTemplate(userId, id, request);
                if (template is null)
                {
                    return NotFound("Recurring income template not found.");
                }

                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update recurring income template");
                return BadRequest("Something went wrong.");
            }
        }

        [HttpDelete("{id:int}")]
        public IActionResult DeleteTemplate([FromRoute] int id)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                var deleted = templates.DeleteTemplate(userId, id);
                if (!deleted)
                {
                    return NotFound("Recurring income template not found.");
                }

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete recurring income template");
                return BadRequest("Something went wrong.");
            }
        }
    }
}
