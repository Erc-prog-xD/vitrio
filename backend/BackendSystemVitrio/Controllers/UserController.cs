
using BackendSystemVitrio.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using BackendSystemVitrio.Services.UserService;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BackendSystemVitrio.DTO;

namespace BackendSystemVitrio.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateMyProfile(UpdateUserDto dto)
        {
            var response = await _userService.UpdateUserAsync(GetUserId(), dto);
            return Ok(response);
        }

        private int GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.Parse(claim!);
        }


    }
}