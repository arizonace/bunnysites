namespace DotnetExample.Models;

public sealed record HealthResponse(string Status, DateTimeOffset CheckedAtUtc);
