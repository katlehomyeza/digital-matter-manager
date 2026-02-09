namespace Backend.API.DTOs
{
    public class UpdateGroupDto
    {
        public string Name { get; set; }
        public int? ParentGroupId { get; set; }
    }
}
