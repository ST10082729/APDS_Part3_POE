import express from 'express';
import { body } from 'express-validator';
import { getDb } from '../db/conn.mjs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

// Validation middleware
const validateLogin = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').trim().notEmpty().withMessage('Password is required')
];

// Authentication middleware
const authenticateEmployee = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const db = getDb();
        const employee = await db.collection('employees').findOne({ 
            _id: decoded.employeeId,
            active: true 
        });

        if (!employee) {
            throw new Error();
        }

        req.employee = employee;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Login route
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { username, password } = req.body;
        const db = getDb();
        
        const employee = await db.collection('employees').findOne({ username });
        
        if (!employee || !employee.active) {
            return res.status(401).json({ message: 'Invalid login credentials' });
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid login credentials' });
        }

        const token = jwt.sign(
            { employeeId: employee._id },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            role: employee.role
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get pending transactions
router.get('/transactions', authenticateEmployee, async (req, res) => {
    try {
        const db = getDb();
        const transactions = await db.collection('payments')
            .find({ verified: { $ne: true } })
            .toArray();

        res.status(200).json({
            message: 'Transactions retrieved successfully',
            data: transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify transaction
router.put('/verify-transaction', authenticateEmployee, async (req, res) => {
    try {
        const { transactionId, verified, notes } = req.body;
        const db = getDb();

        const result = await db.collection('payments').updateOne(
            { _id: transactionId },
            { 
                $set: {
                    verified,
                    verifiedBy: req.employee._id,
                    verificationDate: new Date(),
                    verificationNotes: notes
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json({ message: 'Transaction verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Submit to SWIFT
router.post('/submit-swift', authenticateEmployee, async (req, res) => {
    try {
        const { transactionIds } = req.body;
        const db = getDb();

        const result = await db.collection('payments').updateMany(
            { 
                _id: { $in: transactionIds },
                verified: true,
                submitted: { $ne: true }
            },
            {
                $set: {
                    submitted: true,
                    submittedBy: req.employee._id,
                    submissionDate: new Date()
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ message: 'No valid transactions found for submission' });
        }

        res.status(200).json({ 
            message: 'Transactions submitted successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('SWIFT submission error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;