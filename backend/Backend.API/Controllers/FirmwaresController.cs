using Microsoft.AspNetCore.Mvc;
using Backend.API.Models;
using Backend.API.DTOs;
using Backend.API.Repositories;

namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FirmwaresController : ControllerBase
    {
        private readonly FirmwareRepository _firmwareRepository;

        public FirmwaresController(FirmwareRepository repository)
        {
            _firmwareRepository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllFirmware()
        {
            var firmwares = await _firmwareRepository.GetAllAsync();
            return Ok(firmwares);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFirmwareById(int id)
        {
            var firmware = await _firmwareRepository.GetByIdAsync(id);
            if (firmware == null){
                return NotFound("The firmware with ID " + id + "was not found");
            }
            return Ok(firmware);
        }

        [HttpPost]
        public async Task<IActionResult> CreateFirmware(Firmware firmware)
        {
            var createdFirmware = await _firmwareRepository.CreateAsync(firmware);
            return CreatedAtAction(nameof(GetFirmwareById), new { id = createdFirmware.FirmwareId }, createdFirmware);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFirmware(int id, FirmwareDTO firmware)
        {
            if (firmware == null)
            {
                return BadRequest("Firmware data is required");
            }

            var existingFirmware = await _firmwareRepository.GetByIdAsync(id);
            
            if (existingFirmware == null)
            {
                return NotFound("Firmware not found");
            }

            existingFirmware.Version = firmware.Version;
            existingFirmware.DeviceTypeId = firmware.DeviceTypeId;
            existingFirmware.Name = firmware.Name;

            var updated = await _firmwareRepository.UpdateAsync(existingFirmware);
            
            if (!updated)
            {
                return StatusCode(500, "Failed to update firmware");
            }

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFirmware(int id)
        {
            var deletedFirmware = await _firmwareRepository.DeleteAsync(id);
            if (!deletedFirmware){
                return NotFound();
            }
            return Ok();
        }
    }
}