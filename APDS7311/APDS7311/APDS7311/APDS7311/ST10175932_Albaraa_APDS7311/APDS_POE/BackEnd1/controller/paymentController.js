// paymentController.js

import { body } from 'express-validator';
import { securityMiddleware } from '../middleware/securityMiddleware.js';
import { Payment } from '../models/paymentModel.js';
import { responseHelper } from '../helpers/responseHelper.js';

// Validation rules
export const paymentValidationRules = [
    body('recipientName').trim()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Recipient name must contain only letters and spaces'),
    
    body('recipientBank').trim()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Bank name must contain only letters and spaces'),
    
    body('recipientAccountNo')
        .isLength({ min: 10, max: 20 })
        .matches(/^\d+$/)
        .withMessage('Account number must contain only numbers'),
    
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number'),
    
    body('swiftCode')
        .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
        .withMessage('Invalid SWIFT code format')
];

// Enhanced makePayment function with rate limiting and validation
export const makePayment = [
    securityMiddleware.bruteforce.prevent, // Add brute force protection
    paymentValidationRules,
    securityMiddleware.validateInput,
    async (req, res) => {
        const { recipientName, recipientBank, recipientAccountNo, amount, swiftCode } = req.body;
        const userId = req.user.id;

        try {
            // Additional sanitization
            const sanitizedData = {
                recipientName: recipientName.trim(),
                recipientBank: recipientBank.trim(),
                recipientAccountNo: recipientAccountNo.replace(/\s/g, ''),
                amount: parseFloat(amount),
                swiftCode: swiftCode.toUpperCase(),
                userId
            };

            const payment = new Payment(sanitizedData);
            await payment.save();
            
            responseHelper(res, 201, 'Payment made successfully');
        } catch (err) {
            responseHelper(res, 500, 'Failed to process payment', err);
        }
    }
];