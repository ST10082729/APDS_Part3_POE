import express from 'express';
import { checkAuth } from '../middleware/check-auth.mjs';
import { getDb } from '../db/conn.mjs';

const router = express.Router();

// Input validation functions using RegEx patterns
const validateName = (name) => /^[a-zA-Z ]{2,50}$/.test(name);
const validateBankName = (bank) => /^[a-zA-Z ]{2,50}$/.test(bank);
const validateAccountNumber = (accountNumber) => /^\d{10,20}$/.test(accountNumber);
const validateAmount = (amount) => /^\d+(\.\d{1,2})?$/.test(amount);
const validateSwiftCode = (swiftCode) => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swiftCode);

// Validation middleware
const validatePaymentData = (req, res, next) => {
    const { recipientName, recipientBank, accountNumber, amount, swiftCode } = req.body;

    if (!recipientName || !recipientBank || !accountNumber || !amount || !swiftCode) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validateName(recipientName)) {
        return res.status(400).json({ message: 'Invalid recipient name format' });
    }

    if (!validateBankName(recipientBank)) {
        return res.status(400).json({ message: 'Invalid bank name format' });
    }

    if (!validateAccountNumber(accountNumber)) {
        return res.status(400).json({ message: 'Invalid account number format' });
    }

    if (!validateAmount(amount.toString())) {
        return res.status(400).json({ message: 'Invalid amount format' });
    }

    if (!validateSwiftCode(swiftCode)) {
        return res.status(400).json({ message: 'Invalid SWIFT code format' });
    }

    next();
};

// Create payment route
router.post('/create', checkAuth, validatePaymentData, async (req, res) => {
    try {
        const db = getDb();
        const collection = db.collection("payments");

        const paymentDetails = {
            ...req.body,
            userId: req.userData.userId,
            createdAt: new Date(),
            status: 'pending'
        };

        const result = await collection.insertOne(paymentDetails);
        res.status(201).json({ 
            message: 'Payment processed successfully', 
            paymentId: result.insertedId 
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ 
            message: 'Failed to process payment',
            error: error.message 
        });
    }
});

// Get transactions route
router.get('/transactions', checkAuth, async (req, res) => {
    try {
        const db = getDb();
        const collection = db.collection("payments");
        
        const transactions = await collection
            .find({ userId: req.userData.userId })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            message: 'Transactions retrieved successfully',
            data: transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            message: 'Error fetching transactions',
            error: error.message,
            data: []
        });
    }
});

export default router;
