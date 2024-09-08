using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class CachingService
{
    private readonly IMemoryCache _memoryCache;
    private readonly FirebaseService _firebaseService;
    private const string AllArticlesKey = "all_articles";
    private const string AllGuestBookEntriesKey = "all_guestbook_entries";

    public CachingService(IMemoryCache memoryCache, FirebaseService firebaseService)
    {
        _memoryCache = memoryCache;
        _firebaseService = firebaseService;
    }

    public async Task<List<ArticleModel>> GetArticlesAsync()
    {
        return await GetOrCreateAsync(AllArticlesKey, _firebaseService.GetArticlesAsync);
    }

    public async Task<ArticleModel?> GetArticleByIdAsync(string articleId)
    {
        return await GetOrCreateAsync($"article_{articleId}", () => _firebaseService.GetArticleByIdAsync(articleId));
    }

    private async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> createItem, TimeSpan? absoluteExpireTime = null, TimeSpan? unusedExpireTime = null) where T : class
    {
        if (!_memoryCache.TryGetValue(key, out T cacheEntry))
        {
            cacheEntry = await createItem();

            if (cacheEntry == null)
            {
                // Optionally, handle the case where createItem returns null
                // For example, you could throw an exception or return a default value.
                throw new InvalidOperationException("Cache item creation returned null.");
            }

            var cacheEntryOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = absoluteExpireTime ?? TimeSpan.FromMinutes(10),
                SlidingExpiration = unusedExpireTime
            };

            _memoryCache.Set(key, cacheEntry, cacheEntryOptions);
        }

        return cacheEntry;
    }

    public void InvalidateArticleCache(string? articleId = null)
    {
        if (articleId != null)
        {
            Remove($"article_{articleId}");
        }
        Remove(AllArticlesKey);
    }

    public void Remove(string key)
    {
        _memoryCache.Remove(key);
    }
}
