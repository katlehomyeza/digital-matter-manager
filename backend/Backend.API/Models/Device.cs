namespace Backend.API.Models
{
    public class Device
    {
        public int DeviceId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? SerialNumber { get; set; }
        public int DeviceTypeId { get; set; }
        public int FirmwareId { get; set; }
        public int? GroupId { get; set; }
        public DateTime AddedAt { get; set; }
    }
}