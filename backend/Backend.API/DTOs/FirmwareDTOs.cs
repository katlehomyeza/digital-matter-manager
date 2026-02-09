namespace Backend.API.DTOs
{
    public class FirmwareDTO
    {
        public int DeviceTypeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
    }
}