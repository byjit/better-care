import { createClient, type RedisClientType } from 'redis';

export const redis: RedisClientType = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Connect to Redis
(async () => {
  try {
    await redis.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

// AI Memory functions
export const aiMemory = {
  // Store AI memory for a consultation
  async setMemory(consultationId: string, key: string, value: string): Promise<void> {
    const memoryKey = `ai:memory:${consultationId}:${key}`;
    await redis.set(memoryKey, value);
  },

  // Get AI memory for a consultation
  async getMemory(consultationId: string, key: string): Promise<string | null> {
    const memoryKey = `ai:memory:${consultationId}:${key}`;
    return await redis.get(memoryKey);
  },

  // Get all memories for a consultation
  async getAllMemories(consultationId: string): Promise<Record<string, string>> {
    const pattern = `ai:memory:${consultationId}:*`;
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) {
      return {};
    }

    const values = await redis.mGet(keys);
    const memories: Record<string, string> = {};
    
    keys.forEach((key, index) => {
      const memoryKey = key.replace(`ai:memory:${consultationId}:`, '');
      if (values[index]) {
        memories[memoryKey] = values[index];
      }
    });

    return memories;
  },

  // Add to conversation context
  async addToContext(consultationId: string, message: string): Promise<void> {
    const contextKey = `ai:context:${consultationId}`;
    await redis.lPush(contextKey, message);
    // Keep only last 50 messages for context
    await redis.lTrim(contextKey, 0, 49);
  },

  // Get conversation context
  async getContext(consultationId: string): Promise<string[]> {
    const contextKey = `ai:context:${consultationId}`;
    return await redis.lRange(contextKey, 0, -1);
  },

  // Clear all memories for a consultation (when consultation ends)
  async clearConsultationData(consultationId: string): Promise<void> {
    const memoryPattern = `ai:memory:${consultationId}:*`;
    const contextKey = `ai:context:${consultationId}`;
    
    const memoryKeys = await redis.keys(memoryPattern);
    const allKeys = [...memoryKeys, contextKey];
    
    if (allKeys.length > 0) {
      await redis.del(allKeys);
    }
  }
};
