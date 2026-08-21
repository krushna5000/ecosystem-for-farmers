import crypto from 'crypto';
import fs from 'fs';
import redisClient from '../config/redis.js';

/**
 * Generate a SHA-256 hash of a file's content
 * @param {string} filePath 
 * @returns {Promise<string>}
 */
export const getFileHash = async (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (err) => reject(err));
    });
};

/**
 * Get cached analysis result by image hash
 * @param {string} hash 
 * @returns {Promise<Object|null>}
 */
export const getCachedAnalysis = async (hash) => {
    try {
        if (!redisClient.isOpen) return null;
        const cached = await redisClient.get(`analysis:${hash}`);
        if (cached) {
            console.log(`[CACHE] Hit for hash: ${hash.substring(0, 8)}...`);
            return JSON.parse(cached);
        }
        return null;
    } catch (err) {
        console.error('[CACHE] Get error:', err.message);
        return null;
    }
};

/**
 * Save analysis result to cache
 * @param {string} hash 
 * @param {Object} result 
 * @param {number} ttl - Time to live in seconds (default 7 days)
 */
export const cacheAnalysis = async (hash, result, ttl = 604800) => {
    try {
        if (!redisClient.isOpen) return;
        await redisClient.setEx(`analysis:${hash}`, ttl, JSON.stringify(result));
        console.log(`[CACHE] Saved for hash: ${hash.substring(0, 8)}...`);
    } catch (err) {
        console.error('[CACHE] Set error:', err.message);
    }
};
