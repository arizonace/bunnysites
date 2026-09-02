using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;

namespace DotnetExample.Infrastructure;

public static class ReverseProxyServiceCollectionExtensions
{
    /// <summary>
    /// Trusts forwarding headers only when the request came from the local Nginx proxy.
    /// </summary>
    public static IServiceCollection AddLoopbackReverseProxyForwarding(this IServiceCollection services)
    {
        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.ForwardLimit = 1;

            // Replace framework defaults so 127.0.0.1 is the sole trusted proxy.
            options.KnownNetworks.Clear();
            options.KnownProxies.Clear();
            options.KnownProxies.Add(IPAddress.Loopback);
        });

        return services;
    }
}
