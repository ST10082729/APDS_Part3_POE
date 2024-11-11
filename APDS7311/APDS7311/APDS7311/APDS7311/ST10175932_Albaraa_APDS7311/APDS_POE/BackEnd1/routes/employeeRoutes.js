// employeeRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { securityMiddleware } from '../middleware/securityMiddleware.js';
import { employeeAuth, checkRole, actionRateLimit } from '../middleware/employeeAuth.js';
import { 
    loginEmployee,
    getPendingTransactions,
    verifyTransaction,
    submitToSwift
} from '../controllers/employeeController.js';

const router = express.Router();

// Validation rules
const loginValidation = [
    body('username')
        .trim()
        .isLength({ min: 4, max: 20 })
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage('Invalid username format'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
];

const verificationValidation = [
    body('transactionId')
        .isMongoId()
        .withMessage('Invalid transaction ID'),
    
    body('verified')
        .isBoolean()
        .withMessage('Verified status must be boolean'),
    
    body('verificationNotes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes too long')
];

const swiftSubmissionValidation = [
    body('transactionIds')
        .isArray()
        .withMessage('Transaction IDs must be an array')
        .custom((value) => value.every((id) => /^[0-9a-fA-F]{24}$/.test(id)))
        .withMessage('Invalid transaction ID format')
];

// Routes
router.post('/login', 
    securityMiddleware.bruteforce.prevent,
    loginValidation,
    securityMiddleware.validateInput,
    loginEmployee
);

router.get('/transactions',
    employeeAuth,
    actionRateLimit,
    getPendingTransactions
);

router.put('/verify-transaction',
    employeeAuth,
    checkRole(['verifier', 'supervisor', 'admin']),
    verificationValidation,
    securityMiddleware.validateInput,
    verifyTransaction
);

router.post('/submit-swift',
    employeeAuth,
    checkRole(['supervisor', 'admin']),
    swiftSubmissionValidation,
    securityMiddleware.validateInput,
    submitToSwift
);

export default router;