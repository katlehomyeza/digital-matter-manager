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
                return NotFound("The device with ID " + id + "was not found"); 
            }
               
            return Ok(device);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDevice(Device device)
        {
            if (device == null)
            {
                return BadRequest("Device payload is required");
            }

            if (string.IsNullOrWhiteSpace(device.SerialNumber))
            {
                return BadRequest("Serial number is required");
            }

            var serialExists = await _deviceRepository.SerialNumberExistsAsync(device.SerialNumber);
            if (serialExists)
            {
                return BadRequest("A device with this serial number already exists");
            }

            var createdDevice = await _deviceRepository.CreateAsync(device);

            if (createdDevice.FirmwareId > 0)
            {
                await _deviceRepository.UpdateFirmwareAsync(createdDevice.DeviceId, createdDevice.FirmwareId);
            }

            return CreatedAtAction(
                nameof(GetDeviceById), 
                new { id = createdDevice.DeviceId }, 
                createdDevice
            );
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDevice(int id, Device device)
        {
            if (device == null || string.IsNullOrWhiteSpace(device.SerialNumber))
                return BadRequest("Valid device with serial number required");

            var existingDevice = await _deviceRepository.GetByIdAsync(id);
            if (existingDevice == null)
            {
               return NotFound("The device with ID " + id + "was not found"); 
            } 

            if (existingDevice.SerialNumber != device.SerialNumber)
            {
                var serialExists = await _deviceRepository.SerialNumberExistsForOtherDeviceAsync(id, device.SerialNumber);
                if (serialExists) return BadRequest("Serial number already in use");
            }

            existingDevice.SerialNumber = device.SerialNumber;
            existingDevice.DeviceTypeId = device.DeviceTypeId;
            existingDevice.GroupId = device.GroupId;
            existingDevice.Name = device.Name;

            if (device.FirmwareId != existingDevice.FirmwareId && device.FirmwareId > 0)
            {
                await _deviceRepository.UpdateFirmwareAsync(id, device.FirmwareId);
                existingDevice.FirmwareId = device.FirmwareId;
            }

            var success = await _deviceRepository.UpdateAsync(existingDevice);
            return success ? NoContent() : StatusCode(500, "Update failed");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDevice(int id)
        {
            var deletedDevice = await _deviceRepository.DeleteAsync(id);
            if (!deletedDevice){
                return NotFound();
            }
            return Ok();
        }

        [HttpPut("{id}/firmware")]
        public async Task<IActionResult> UpdateFirmware(int id, [FromBody] int firmwareId)
        {
            var updatedFirmware = await _deviceRepository.UpdateFirmwareAsync(id, firmwareId);
            if (!updatedFirmware){
                return NotFound();
            }
            return Ok();
        }

        [HttpGet("{id}/firmware-history")]
        public async Task<IActionResult> GetFirmwareHistory(int id)
        {
            var history = await _deviceRepository.GetFirmwareHistoryAsync(id);
            return Ok(history);
        }
    }
}