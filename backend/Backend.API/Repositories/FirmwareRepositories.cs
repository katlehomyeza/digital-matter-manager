using Dapper;
using Backend.API.Models;
using Backend.API.Services;

namespace Backend.API.Repositories
{
    public class FirmwareRepository
    {
        private readonly DatabaseService _db;

        public FirmwareRepository(DatabaseService db)
        {
            _db = db;
        }

        public async Task<IEnumerable<Firmware>> GetAllAsync()
        {
            using var connection = _db.CreateConnection();
            var sql = "SELECT firmware_id, version, created_at FROM firmware";
            return await connection.QueryAsync<Firmware>(sql);
        }

        public async Task<Firmware?> GetByIdAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var sql = "SELECT firmware_id, version, created_at FROM firmware WHERE firmware_id = @Id";
            return await connection.QueryFirstOrDefaultAsync<Firmware>(sql, new { Id = id });
        }

        public async Task<Firmware> CreateAsync(Firmware firmware)
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                INSERT INTO firmware (version, created_at) 
                VALUES (@Version, @CreatedAt) 
                RETURNING firmware_id, version, created_at";
            
            firmware.CreatedAt = DateTime.UtcNow;
            return await connection.QuerySingleAsync<Firmware>(sql, firmware);
        }

        public async Task<bool> UpdateAsync(Firmware firmware)
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                UPDATE firmware 
                SET version = @Version 
                WHERE firmware_id = @FirmwareId";
            
            var rows = await connection.ExecuteAsync(sql, firmware);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var sql = "DELETE FROM firmware WHERE firmware_id = @Id";
            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }
    }
}