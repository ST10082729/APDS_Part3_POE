// employeeController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Employee } from '../models/employeeModel.js';
import { Payment } from '../models/paymentModel.js';
import { responseHelper } from '../helpers/responseHelper.js';

// Employee login
export const loginEmployee = async (req, res) => {
    const { username, password } = req.body;

    try {
        const employee = await Employee.findOne({ username, active: true });

        if (!employee) {
            return responseHelper(res, 401, "Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return responseHelper(res, 401, "Invalid credentials");
        }

        // Update last login
        employee.lastLogin = new Date();
        await employee.save();

        const token = jwt.sign(
            { 
                userId: employee._id,
                role: employee.role,
                employeeId: employee.employeeId
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        responseHelper(res, 200, "Login successful", { token, role: employee.role });
    } catch (err) {
        console.error("Employee login error:", err);
        responseHelper(res, 500, "Internal server error");
    }
};

// Get pending transactions
export const getPendingTransactions = async (req, res) => {
    try {
        const transactions = await Payment.find({
            verified: { $ne: true },
            submitted: { $ne: true }
        }).sort({ createdAt: -1 });

        responseHelper(res, 200, "Transactions retrieved successfully", transactions);
    } catch (err) {
        console.error("Error fetching transactions:", err);
        responseHelper(res, 500, "Failed to fetch transactions");
    }
};

// Verify transaction
export const verifyTransaction = async (req, res) => {
    const { transactionId, verified, verificationNotes } = req.body;
    const employeeId = req.employee.employeeId;

    try {
        const transaction = await Payment.findById(transactionId);
        
        if (!transaction) {
            return responseHelper(res, 404, "Transaction not found");
        }

        transaction.verified = verified;
        transaction.verifiedBy = employeeId;
        transaction.verificationNotes = verificationNotes;
        transaction.verificationDate = new Date();

        await transaction.save();

        // Log the action
        const employee = await Employee.findOne({ employeeId });
        employee.actionLog.push({
            action: verified ? 'VERIFY' : 'REJECT',
            transactionId: transaction._id
        });
        await employee.save();

        responseHelper(res, 200, "Transaction verification updated", transaction);
    } catch (err) {
        console.error("Verification error:", err);
        responseHelper(res, 500, "Failed to verify transaction");
    }
};

// Submit to SWIFT
export const submitToSwift = async (req, res) => {
    const { transactionIds } = req.body;
    const employeeId = req.employee.employeeId;

    try {
        // Verify all transactions exist and are verified
        const transactions = await Payment.find({
            _id: { $in: transactionIds },
            verified: true,
            submitted: { $ne: true }
        });

        if (transactions.length !== transactionIds.length) {
            return responseHelper(res, 400, "Some transactions are not valid for submission");
        }

        // Update all transactions
        const updatePromises = transactions.map(async (transaction) => {
            transaction.submitted = true;
            transaction.submittedBy = employeeId;
            transaction.submissionDate = new Date();
            return transaction.save();
        });

        await Promise.all(updatePromises);

        // Log actions
        const employee = await Employee.findOne({ employeeId });
        const logPromises = transactions.map(transaction => {
            employee.actionLog.push({
                action: 'SWIFT_SUBMIT',
                transactionId: transaction._id
            });
        });
        await employee.save();

        responseHelper(res, 200, "Transactions submitted to SWIFT successfully");
    } catch (err) {
        console.error("SWIFT submission error:", err);
        responseHelper(res, 500, "Failed to submit transactions to SWIFT");
    }
};