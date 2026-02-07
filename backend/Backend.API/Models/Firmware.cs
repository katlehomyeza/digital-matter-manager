namespace Backend.API.Models
{
    public class Firmware
    {
        public int FirmwareId { get; set; }
        public int DeviceTypeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}