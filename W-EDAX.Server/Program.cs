using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;
using Microsoft.AspNetCore.Authentication.Cookies;
using FireSharp.Config;
using FireSharp.Interfaces;
using FluentEmail.Core;
using FluentEmail.Mailgun;

var builder = WebApplication.CreateBuilder(args);

// Load configuration from appsettings.json
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// Configure Serilog for logging
builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.File("logs/log.txt", rollingInterval: RollingInterval.Day);
});

// Register Firebase configuration
builder.Services.AddSingleton<IFirebaseConfig>(new FirebaseConfig
{
    AuthSecret = builder.Configuration["Firebase:AuthSecret"],
    BasePath = builder.Configuration["Firebase:BasePath"]
});

// Register Firebase client
builder.Services.AddSingleton<IFirebaseClient>(provider =>
{
    var config = provider.GetRequiredService<IFirebaseConfig>();
    return new FireSharp.FirebaseClient(config);
});

// Register services
builder.Services.AddTransient<ArticleService>();
builder.Services.AddTransient<GuestBookService>();
builder.Services.AddTransient<EmailService>(); 


// Register Mailgun sender
var sender = new MailgunSender(
    builder.Configuration["Mailgun:Domain"], // Mailgun Domain
    builder.Configuration["Mailgun:ApiKey"]  // Mailgun API Key
);
Email.DefaultSender = sender; // Set the default sender for FluentEmail

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// Add services to the DI container
builder.Services.AddControllers();

// Configure Authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// Use CORS before routing
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
