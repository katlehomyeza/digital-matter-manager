namespace Backend.API.DTOs
{
    public class DeviceDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? SerialNumber { get; set; }
        public int DeviceTypeId { get; set; }
        public int FirmwareId { get; set; }
        public int? GroupId { get; set; }
    }
}