import dotenv from 'dotenv';

dotenv.config();

const getConfig = () => {
    const required = [
        'ATLAS_URI',
        'JWT_SECRET',
        'PORT'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return {
        database: {
            uri: process.env.ATLAS_URI
        },
        server: {
            port: process.env.PORT || 3000,
            nodeEnv: process.env.NODE_ENV || 'development'
        },
        security: {
            jwtSecret: process.env.JWT_SECRET,
            rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
            rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50,
            bruteForceRetries: parseInt(process.env.BRUTE_FORCE_FREE_RETRIES) || 5,
            bruteForceWaitTime: parseInt(process.env.BRUTE_FORCE_WAIT_TIME) || 60000
        },
        frontend: {
            url: process.env.FRONTEND_URL || 'http://localhost:3001'
        },
        cookie: {
            secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
            maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 86400000
        }
    };
};

export const config = getConfig();