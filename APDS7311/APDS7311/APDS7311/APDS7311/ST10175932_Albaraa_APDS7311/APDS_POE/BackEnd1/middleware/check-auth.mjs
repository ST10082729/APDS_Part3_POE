import jwt from 'jsonwebtoken';
import ExpressBrute from 'express-brute';

// Configure brute force protection
const store = new ExpressBrute.MemoryStore();
export const bruteforce = new ExpressBrute(store, {
    freeRetries: 5,
    minWait: 60 * 1000, // 1 minute
    maxWait: 60 * 60 * 1000 // 1 hour
});

export const checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { userId: decodedToken.userId };

        // Add security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ 
            message: "Authentication failed",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const validateSession = (req, res, next) => {
    if (!req.userData || !req.userData.userId) {
        return res.status(401).json({ message: "Invalid session" });
    }
    next();
};