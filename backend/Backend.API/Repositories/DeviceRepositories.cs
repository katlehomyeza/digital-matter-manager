using Dapper;
using Backend.API.Models;
using Backend.API.Services;

namespace Backend.API.Repositories
{
    public class DeviceRepository
    {
        private readonly DatabaseService _db;

        public DeviceRepository(DatabaseService db)
        {
            _db = db;
        }

        public async Task<IEnumerable<Device>> GetAllAsync()
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                SELECT 
                    device_id as DeviceId, 
                    name as Name, 
                    serial_number as SerialNumber, 
                    device_type_id as DeviceTypeId, 
                    firmware_id as FirmwareId, 
                    group_id as GroupId, 
                    added_at as AddedAt
                FROM devices";
            return await connection.QueryAsync<Device>(sql);
        }

        public async Task<Device?> GetByIdAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                SELECT 
                    device_id as DeviceId, 
                    name as Name, 
                    serial_number as SerialNumber, 
                    device_type_id as DeviceTypeId, 
                    firmware_id as FirmwareId, 
                    group_id as GroupId, 
                    added_at as AddedAt
                FROM devices 
                WHERE device_id = @Id";
            return await connection.QueryFirstOrDefaultAsync<Device>(sql, new { Id = id });
        }

        public async Task<Device> CreateAsync(Device device)
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                INSERT INTO devices (name, serial_number, device_type_id, firmware_id, group_id, added_at) 
                VALUES (@Name, @SerialNumber, @DeviceTypeId, @FirmwareId, @GroupId, @AddedAt) 
                RETURNING 
                    device_id as DeviceId, 
                    name as Name, 
                    serial_number as SerialNumber, 
                    device_type_id as DeviceTypeId, 
                    firmware_id as FirmwareId, 
                    group_id as GroupId, 
                    added_at as AddedAt";
            
            device.AddedAt = DateTime.UtcNow;
            return await connection.QuerySingleAsync<Device>(sql, device);
        }

        public async Task<bool> UpdateAsync(Device device)
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                UPDATE devices 
                SET name = @Name, 
                    serial_number = @SerialNumber, 
                    device_type_id = @DeviceTypeId, 
                    firmware_id = @FirmwareId, 
                    group_id = @GroupId 
                WHERE device_id = @DeviceId";
            
            var rows = await connection.ExecuteAsync(sql, device);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var sql = "DELETE FROM devices WHERE device_id = @Id";
            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }

        public async Task<bool> UpdateFirmwareAsync(int deviceId, int firmwareId)
        {
            using var connection = _db.CreateConnection();
            
            var updateSql = "UPDATE devices SET firmware_id = @FirmwareId WHERE device_id = @DeviceId";
            await connection.ExecuteAsync(updateSql, new { DeviceId = deviceId, FirmwareId = firmwareId });
            
            var historySql = @"
                INSERT INTO device_firmware_history (device_id, firmware_id, installed_at) 
                VALUES (@DeviceId, @FirmwareId, @InstalledAt)";
            await connection.ExecuteAsync(historySql, new 
            { 
                DeviceId = deviceId, 
                FirmwareId = firmwareId, 
                InstalledAt = DateTime.UtcNow 
            });
            
            return true;
        }

        public async Task<IEnumerable<DeviceFirmwareHistory>> GetFirmwareHistoryAsync(int deviceId)
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                SELECT 
                    device_firmware_history_id as DeviceFirmwareHistoryId, 
                    device_id as DeviceId, 
                    firmware_id as FirmwareId, 
                    installed_at as InstalledAt
                FROM device_firmware_history 
                WHERE device_id = @DeviceId";
            return await connection.QueryAsync<DeviceFirmwareHistory>(sql, new { DeviceId = deviceId });
        }

        public async Task<bool> SerialNumberExistsAsync(string serialNumber)
        {
            using var connection = _db.CreateConnection();

            var sql = @"
                SELECT EXISTS (
                    SELECT 1 
                    FROM devices 
                    WHERE serial_number = @SerialNumber
                )";

            return await connection.ExecuteScalarAsync<bool>(sql, new { SerialNumber = serialNumber });
        }

        public async Task<bool> SerialNumberExistsForOtherDeviceAsync(int deviceId, string serialNumber)
        {
            using var connection = _db.CreateConnection();

            var sql = @"
                SELECT EXISTS (
                    SELECT 1 
                    FROM devices 
                    WHERE serial_number = @SerialNumber
                    AND device_id != @DeviceId
                )";

            return await connection.ExecuteScalarAsync<bool>(sql, new 
            { 
                SerialNumber = serialNumber, 
                DeviceId = deviceId 
            });
        }
    }
}