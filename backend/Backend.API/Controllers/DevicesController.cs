using Microsoft.AspNetCore.Mvc;
using Backend.API.Models;
using Backend.API.Repositories;

namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DevicesController : ControllerBase
    {
        private readonly DeviceRepository _deviceRepository;

        public DevicesController(DeviceRepository repository)
        {
            _deviceRepository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDevices()
        {
            var devices = await _deviceRepository.GetAllAsync();
            return Ok(devices);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDeviceById(int id)
        {
            var device = await _deviceRepository.GetByIdAsync(id);
            if (device == null){
                return NotFound(); 
            }
               
            return Ok(device);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDevice(Device device)
        {
            var createdDevice = await _deviceRepository.CreateAsync(device);
            
            await _deviceRepository.UpdateFirmwareAsync(created.DeviceId, createdDevice.FirmwareId);
            
            return CreatedAtAction(nameof(GetById), new { id = created.DeviceId }, createdDevice);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDevice(int id, Device device)
        {
            if (id != device.DeviceId){
               return BadRequest(); 
            }
            
            var updatedDevice = await _deviceRepository.UpdateAsync(device);
            if (!updatedDevice){
                return NotFound();
            }
            
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDevice(int id)
        {
            var deletedDevice = await _deviceRepository.DeleteAsync(id);
            if (!deletedDevice){
                return NotFound();
            }
            return NoContent();
        }

        [HttpPut("{id}/firmware")]
        public async Task<IActionResult> UpdateFirmware(int id, [FromBody] int firmwareId)
        {
            var updatedFirmware = await _deviceRepository.UpdateFirmwareAsync(id, firmwareId);
            if (!updatedFirmware){
                return NotFound();
            }
            return NoContent();
        }

        [HttpGet("{id}/firmware-history")]
        public async Task<IActionResult> GetFirmwareHistory(int id)
        {
            var history = await _deviceRepository.GetFirmwareHistoryAsync(id);
            return Ok(history);
        }
    }
}