namespace Backend.API.Models
{
    public class Group
    {
        public int GroupId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int? ParentGroupId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}