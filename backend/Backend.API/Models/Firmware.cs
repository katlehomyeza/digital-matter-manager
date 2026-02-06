namespace Backend.API.Models
{
    public class Firmware
    {
        public int FirmwareId { get; set; }
        public string Version { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}