using DotnetExample.Infrastructure;
using DotnetExample.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddLoopbackReverseProxyForwarding();
builder.Services.AddRazorPages();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    // Deliberately renders a generic page: exception details stay in server logs.
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// Nginx is the only trusted proxy. This must precede HTTPS redirection and any
// future authentication middleware so the original scheme and client address are used.
app.UseForwardedHeaders();
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new HealthResponse("Healthy", DateTimeOffset.UtcNow)))
    .WithName("HealthCheck")
    .AllowAnonymous();

app.MapRazorPages();

app.Run();
