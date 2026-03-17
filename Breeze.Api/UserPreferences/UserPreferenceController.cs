using Breeze.Api.UserPreferences.RequestResponseObjects;
using Breeze.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Breeze.Api.UserPreferences
{
    [Authorize]
    [ApiController]
    [Route("/user-preferences")]
    public class UserPreferenceController : ControllerBase
    {
        private readonly UserPreferenceService preferences;
        private readonly ILogger<UserPreferenceController> _logger;

        public UserPreferenceController(IConfiguration config, ILogger<UserPreferenceController> logger, BreezeContext breezeContext)
        {
            preferences = new UserPreferenceService(config, breezeContext, logger);
            _logger = logger;
        }

        [HttpGet]
        public IActionResult GetUserPreference()
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                var preference = preferences.GetOrCreateByUserId(userId);
                if (preference is null)
                {
                    return BadRequest("Failed to load user preferences.");
                }

                return Ok(preference);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get user preferences");
                return BadRequest("Something went wrong.");
            }
        }

        [HttpPut]
        public IActionResult PutUserPreference([FromBody] UserPreferenceRequest request)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                var preference = preferences.UpsertByUserId(userId, request);
                if (preference is null)
                {
                    return BadRequest("Failed to save user preferences.");
                }

                return Ok(preference);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upsert user preferences");
                return BadRequest("Something went wrong.");
            }
        }
    }
}
