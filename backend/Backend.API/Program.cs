using DotNetEnv;
using Backend.API.Services;
using Backend.API.Repositories;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();

builder.Services.Configure<RouteOptions>(options =>
{
    options.LowercaseUrls = true;
});

// Register services
builder.Services.AddSingleton<DatabaseService>();
builder.Services.AddScoped<GroupRepository>();
builder.Services.AddScoped<FirmwareRepository>();
builder.Services.AddScoped<DeviceRepository>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();