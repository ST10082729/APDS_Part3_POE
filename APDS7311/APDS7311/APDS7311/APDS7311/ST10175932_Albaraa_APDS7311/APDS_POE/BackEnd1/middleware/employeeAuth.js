// employeeAuth.js
import jwt from 'jsonwebtoken';
import { Employee } from '../models/employeeModel.js';
import { responseHelper } from '../helpers/responseHelper.js';

export const employeeAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return responseHelper(res, 401, "Authentication required");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const employee = await Employee.findOne({ 
            _id: decoded.userId,
            active: true
        });

        if (!employee) {
            return responseHelper(res, 401, "Invalid authentication");
        }

        req.employee = {
            id: employee._id,
            employeeId: employee.employeeId,
            role: employee.role
        };
        
        next();
    } catch (err) {
        console.error("Authentication error:", err);
        responseHelper(res, 401, "Authentication failed");
    }
};

// Middleware to check employee role
export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.employee || !allowedRoles.includes(req.employee.role)) {
            return responseHelper(res, 403, "Insufficient privileges");
        }
        next();
    };
};

// Rate limiting for employee actions
export const actionRateLimit = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
};