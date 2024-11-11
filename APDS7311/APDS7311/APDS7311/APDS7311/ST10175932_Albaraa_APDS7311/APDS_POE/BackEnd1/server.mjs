import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectToServer } from './db/conn.mjs';
import userRoutes from './routes/user.mjs';
import paymentRoutes from './routes/payment.mjs';
import employeeRoutes from './routes/employee.mjs';  // New import
import ExpressBrute from 'express-brute';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Brute force protection
const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store, {
    freeRetries: 5,
    minWait: 60 * 1000,
    maxWait: 60 * 60 * 1000,
});

// Security setup
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(limiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Brute force protection for login routes
app.use('/user/login', bruteforce.prevent);
app.use('/employee/login', bruteforce.prevent);  // New protection

// Routes
app.use('/user', userRoutes);
app.use('/payment', paymentRoutes);
app.use('/employee', employeeRoutes);  // New route

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the APDS API');
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            message: 'Invalid token',
            error: 'Unauthorized access'
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            error: err.message
        });
    }

    res.status(err.status || 500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Server startup
const startServer = async () => {
    try {
        await connectToServer();
        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
};

startServer();

export default app;