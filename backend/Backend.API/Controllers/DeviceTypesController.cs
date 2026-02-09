using Microsoft.AspNetCore.Mvc;
using Backend.API.Models;
using Backend.API.DTOs;
using Backend.API.Repositories;

namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeviceTypesController : ControllerBase
    {
        private readonly DeviceTypeRepository _deviceTypeRepository;

        public DeviceTypesController(DeviceTypeRepository deviceTypeRepository)
        {
            _deviceTypeRepository = deviceTypeRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var deviceTypes = await _deviceTypeRepository.GetAllAsync();
            return Ok(deviceTypes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var deviceType = await _deviceTypeRepository.GetByIdAsync(id);

            if (deviceType == null)
            {
                return NotFound("The device type with ID " + id + "was not found");
            }

            return Ok(deviceType);
        }

        [HttpGet("{id}/devices")]
        public async Task<IActionResult> GetDevices(int id)
        {
            var devices = await _deviceTypeRepository.GetDevicesByTypeIdAsync(id);
            return Ok(devices);
        }

        [HttpPost]
        public async Task<IActionResult> Create(DeviceType deviceType)
        {
            var createdDeviceType = await _deviceTypeRepository.CreateAsync(deviceType);
            return CreatedAtAction(nameof(GetById), new { id = createdDeviceType.DeviceTypeId }, createdDeviceType);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DeviceTypeDTO deviceTypeDto)
        {
            var existingDeviceType = await _deviceTypeRepository.GetByIdAsync(id);
            
            if (existingDeviceType == null)
            {
                return NotFound("The device type with ID " + id + "was not found");
            }

            existingDeviceType.Name = deviceTypeDto.Name;
            existingDeviceType.Description = deviceTypeDto.Description;
            
            var updated = await _deviceTypeRepository.UpdateAsync(existingDeviceType);
            
            if (!updated)
            {
                return StatusCode(500, "An error occurred while updating the device type");
            }
            
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deviceCount = await _deviceTypeRepository.GetDeviceCountByTypeIdAsync(id);

            if (deviceCount > 0)
            {
                return BadRequest("Cannot delete device type that is assigned to devices");
            }

            var deleted = await _deviceTypeRepository.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound();
            }

            return Ok();
        }
    }
}