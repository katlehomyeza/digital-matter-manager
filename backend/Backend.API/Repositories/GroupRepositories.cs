using Dapper;
using Backend.API.Models;
using Backend.API.Services;

namespace Backend.API.Repositories
{
    public class GroupRepository
    {
        private readonly DatabaseService _db;

        public GroupRepository(DatabaseService db)
        {
            _db = db;
        }

        public async Task<IEnumerable<Group>> GetAllAsync()
        {
            using var connection = _db.CreateConnection();
            var sql = "SELECT group_id, name, parent_group_id, created_at FROM groups";
            return await connection.QueryAsync<Group>(sql);
        }

        public async Task<Group?> GetByIdAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var sql = "SELECT group_id, name, parent_group_id, created_at FROM groups WHERE group_id = @Id";
            return await connection.QueryFirstOrDefaultAsync<Group>(sql, new { Id = id });
        }

        public async Task<Group> CreateAsync(Group group)
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                INSERT INTO groups (name, parent_group_id, created_at) 
                VALUES (@Name, @ParentGroupId, @CreatedAt) 
                RETURNING group_id, name, parent_group_id, created_at";
            
            group.CreatedAt = DateTime.UtcNow;
            return await connection.QuerySingleAsync<Group>(sql, group);
        }

        public async Task<bool> UpdateAsync(Group group)
        {
            using var connection = _db.CreateConnection();
            var sql = @"
                UPDATE groups 
                SET name = @Name, parent_group_id = @ParentGroupId 
                WHERE group_id = @GroupId";
            
            var rows = await connection.ExecuteAsync(sql, group);
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = _db.CreateConnection();
            var sql = "DELETE FROM groups WHERE group_id = @Id";
            var rows = await connection.ExecuteAsync(sql, new { Id = id });
            return rows > 0;
        }
    }
}