// employeeModel.js
import mongoose from '../db/conn.mjs';

const employeeSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 4,
        maxlength: 20,
        match: [/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers']
    },
    password: {
        type: String,
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['verifier', 'supervisor', 'admin'],
        default: 'verifier'
    },
    active: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    actionLog: [{
        action: String,
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    collection: 'employees'
});

// Add index for performance
employeeSchema.index({ username: 1, employeeId: 1 });

export const Employee = mongoose.model('Employee', employeeSchema);