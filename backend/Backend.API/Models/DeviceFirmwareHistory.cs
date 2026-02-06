namespace Backend.API.Models
{
    public class DeviceFirmwareHistory
    {
        public int DeviceFirmwareHistoryId { get; set; }
        public int DeviceId { get; set; }
        public int FirmwareId { get; set; }
        public DateTime InstalledAt { get; set; }
    }
}