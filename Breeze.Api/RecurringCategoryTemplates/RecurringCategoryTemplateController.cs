using Breeze.Api.RecurringCategoryTemplates.RequestResponseObjects;
using Breeze.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Breeze.Api.RecurringCategoryTemplates
{
    [Authorize]
    [ApiController]
    [Route("/recurring-category-templates")]
    public class RecurringCategoryTemplateController : ControllerBase
    {
        private readonly RecurringCategoryTemplateService templates;
        private readonly ILogger<RecurringCategoryTemplateController> _logger;

        public RecurringCategoryTemplateController(IConfiguration config, ILogger<RecurringCategoryTemplateController> logger, BreezeContext breezeContext)
        {
            templates = new RecurringCategoryTemplateService(config, breezeContext, logger);
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
                _logger.LogError(ex, "Failed to get recurring category templates");
                return BadRequest("Something went wrong.");
            }
        }

        [HttpPost]
        public IActionResult PostTemplate([FromBody] RecurringCategoryTemplateRequest request)
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
                    return BadRequest("Failed to create recurring category template.");
                }

                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create recurring category template");
                return BadRequest("Something went wrong.");
            }
        }

        [HttpPatch("{id:int}")]
        public IActionResult PatchTemplate([FromRoute] int id, [FromBody] RecurringCategoryTemplateRequest request)
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
                    return NotFound("Recurring category template not found.");
                }

                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update recurring category template");
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
                    return NotFound("Recurring category template not found.");
                }

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete recurring category template");
                return BadRequest("Something went wrong.");
            }
        }
    }
}
