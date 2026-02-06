using Microsoft.AspNetCore.Mvc;
using Backend.API.Models;
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
                return NotFound();
            }
            return Ok(firmware);
        }

        [HttpPost]
        public async Task<IActionResult> CreateFirmware(Firmware firmware)
        {
            var createdFirmware = await _firmwareRepository.CreateAsync(firmware);
            return CreatedAtAction(nameof(GetById), new { id = created.FirmwareId }, createdFirmware);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFirmware(int id, Firmware firmware)
        {
            if (id != firmware.FirmwareId){
                return BadRequest();
            }
            var updatedFirmware = await _firmwareRepository.UpdateAsync(firmware);
            if (!updatedFirmware){
                return NotFound();
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFirmware(int id)
        {
            var deletedFirmware = await _firmwareRepository.DeleteAsync(id);
            if (!deletedFirmware){
                return NotFound();
            }
            return NoContent();
        }
    }
}