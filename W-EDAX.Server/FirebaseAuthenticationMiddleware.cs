using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

public class FirebaseAuthenticationMiddleware
{
    private readonly RequestDelegate _next;

    public FirebaseAuthenticationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Implement custom logic here if needed
        // For example, you might check for Firebase ID tokens in headers

        await _next(context);
    }
}

// Extension method for adding the middleware
public static class FirebaseAuthenticationMiddlewareExtensions
{
    public static IApplicationBuilder UseFirebaseAuthenticationMiddleware(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<FirebaseAuthenticationMiddleware>();
    }
}
