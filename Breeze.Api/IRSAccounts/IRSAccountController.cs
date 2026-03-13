using Breeze.Api.IRSAccounts.RequestResponseObjects;
using Breeze.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Breeze.Api.IRSAccounts
{
    [Authorize]
    [ApiController]
    [Route("/irs-accounts")]
    public class IRSAccountController : ControllerBase
    {
        private readonly IRSAccountService irsAccounts;
        private readonly ILogger<IRSAccountController> _logger;

        public IRSAccountController(IConfiguration config, ILogger<IRSAccountController> logger, BreezeContext breezeContext)
        {
            irsAccounts = new IRSAccountService(config, breezeContext, logger);
            _logger = logger;
        }

        [HttpGet]
        public IActionResult GetIRSAccounts()
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                return Ok(irsAccounts.GetIRSAccounts());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetIRSAccountById([FromRoute] int id)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                var account = irsAccounts.GetIRSAccountById(id);
                if (account is null)
                {
                    return NotFound();
                }

                return Ok(account);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult PostIRSAccount([FromBody] IRSAccountRequest irsAccountRequest)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                var response = irsAccounts.CreateIRSAccount(irsAccountRequest);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch]
        public IActionResult PatchIRSAccount([FromBody] IRSAccountRequest irsAccountRequest)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                var response = irsAccounts.UpdateIRSAccount(irsAccountRequest);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteIRSAccount([FromRoute] int id)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogError(User.ToString());
                    return Unauthorized();
                }

                return Ok(irsAccounts.DeleteIRSAccountById(id));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return BadRequest(ex.Message);
            }
        }
    }
}
