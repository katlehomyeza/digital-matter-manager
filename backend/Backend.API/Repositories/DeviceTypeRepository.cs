using Dapper;
using Backend.API.Models;
using Backend.API.Services;

namespace Backend.API.Repositories
{
    public class DeviceTypeRepository 
    {
        private readonly DatabaseService _db;

        public DeviceTypeRepository(DatabaseService db)
        {
            _db = db;
        }

        public async Task<IEnumerable<DeviceType>> GetAllAsync()
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                SELECT 
                    device_type_id as DeviceTypeId,
                    name as Name,
                    description as Description,
                    created_at as CreatedAt
                FROM device_types 
                ORDER BY name";
            
            return await connection.QueryAsync<DeviceType>(sql);
        }

        public async Task<DeviceType?> GetByIdAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                SELECT 
                    device_type_id as DeviceTypeId,
                    name as Name,
                    description as Description,
                    created_at as CreatedAt
                FROM device_types 
                WHERE device_type_id = @Id";
            
            return await connection.QueryFirstOrDefaultAsync<DeviceType>(sql, new { Id = id });
        }

        public async Task<IEnumerable<object>> GetDevicesByTypeIdAsync(int deviceTypeId)
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                SELECT 
                    d.device_id as DeviceId,
                    d.name as Name,
                    d.serial_number as SerialNumber,
                    d.device_type_id as DeviceTypeId,
                    d.firmware_id as FirmwareId,
                    d.group_id as GroupId,
                    d.added_at as AddedAt,
                    f.version as FirmwareVersion
                FROM devices d
                LEFT JOIN firmware f ON d.firmware_id = f.firmware_id
                WHERE d.device_type_id = @DeviceTypeId
                ORDER BY d.name";
            
            return await connection.QueryAsync(sql, new { DeviceTypeId = deviceTypeId });
        }

        public async Task<DeviceType> CreateAsync(DeviceType deviceType)
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                INSERT INTO device_types (name, description, created_at) 
                VALUES (@Name, @Description, @CreatedAt) 
                RETURNING 
                    device_type_id as DeviceTypeId, 
                    name as Name, 
                    description as Description, 
                    created_at as CreatedAt";
            
            deviceType.CreatedAt = DateTime.UtcNow;
            return await connection.QuerySingleAsync<DeviceType>(sql, deviceType);
        }

        public async Task<bool> UpdateAsync(DeviceType deviceType)
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                UPDATE device_types 
                SET name = @Name, 
                    description = @Description 
                WHERE device_type_id = @DeviceTypeId";
            
            var rows = await connection.ExecuteAsync(sql, deviceType);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var sql = "DELETE FROM device_types WHERE device_type_id = @Id";
            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }

        public async Task<int> GetDeviceCountByTypeIdAsync(int deviceTypeId)
        {
            using var connection = _db.CreateConnection();
            var sql = "SELECT COUNT(*) FROM devices WHERE device_type_id = @DeviceTypeId";
            return await connection.ExecuteScalarAsync<int>(sql, new { DeviceTypeId = deviceTypeId });
        }
    }
}