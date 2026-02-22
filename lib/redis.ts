import { createClient } from 'redis';

const globalForRedis = globalThis as unknown as {
    redis: ReturnType<typeof createClient> | undefined;
};

const redis =
    globalForRedis.redis ??
    createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Connect to Redis
if (!redis.isOpen) {
    redis.connect().catch(console.error);
}

// Helper functions
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis GET error:', error);
        return null;
    }
}

export async function setCache(
    key: string,
    value: any,
    expirationInSeconds: number = 3600
): Promise<boolean> {
    try {
        await redis.setEx(key, expirationInSeconds, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Redis SET error:', error);
        return false;
    }
}

export async function deleteCache(key: string): Promise<boolean> {
    try {
        await redis.del(key);
        return true;
    } catch (error) {
        console.error('Redis DELETE error:', error);
        return false;
    }
}

export default redis;
