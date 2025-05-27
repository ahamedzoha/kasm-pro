import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Promise<T | null>
   */
  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in milliseconds (optional)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (ttl) {
      await this.cacheManager.set(key, value, ttl);
    } else {
      await this.cacheManager.set(key, value);
    }
  }

  /**
   * Delete a value from cache
   * @param key Cache key to delete
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * Get or set a value with a factory function
   * @param key Cache key
   * @param factory Function to generate value if not cached
   * @param ttl Time to live in milliseconds (optional)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    let value = await this.get<T>(key);

    if (value === null || value === undefined) {
      value = await factory();
      await this.set(key, value, ttl);
    }

    return value;
  }

  /**
   * Wrap a function with caching
   * @param keyFactory Function to generate cache key
   * @param factory Function to execute if not cached
   * @param ttl Time to live in milliseconds (optional)
   */
  async wrap<T>(
    keyFactory: (...args: any[]) => string,
    factory: (...args: any[]) => Promise<T>,
    ttl?: number
  ) {
    return async (...args: any[]): Promise<T> => {
      const key = keyFactory(...args);
      return this.getOrSet(key, () => factory(...args), ttl);
    };
  }
}
