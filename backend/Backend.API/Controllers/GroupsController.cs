using Microsoft.AspNetCore.Mvc;
using Backend.API.Models;
using Backend.API.Repositories;

namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : ControllerBase
    {
        private readonly GroupRepository _groupRepository;

        public GroupsController(GroupRepository repository)
        {
            _groupRepository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllGroups()
        {
            var groups = await _groupRepository.GetAllAsync();
            return Ok(groups);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetGroupById(int id)
        {
            var group = await _groupRepository.GetByIdAsync(id);
            if (group == null){
                return NotFound();
            }
            return Ok(group);
        }

        [HttpPost]
        public async Task<IActionResult> CreateGroup(Group group)
        {
            var createdGroup = await _groupRepository.CreateAsync(group);
            return CreatedAtAction(nameof(GetGroupById), new { id = createdGroup.GroupId }, createdGroup);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGroup(int id, Group group)
        {
            if (id != group.GroupId){
                return BadRequest();
            }
            var updatedGroup = await _groupRepository.UpdateAsync(group);
            if (!updatedGroup){
                return NotFound();
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGroup(int id)
        {
            var deletedGroup = await _groupRepository.DeleteAsync(id);
            if (!deletedGroup){
                return NotFound();
            }
            return NoContent();
        }
    }
}