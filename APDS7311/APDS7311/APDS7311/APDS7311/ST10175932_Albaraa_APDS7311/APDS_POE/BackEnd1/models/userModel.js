import mongoose from '../db/conn.mjs';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 30
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
    },
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
    accountNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10,12}$/, 'Please enter a valid account number']
    },
    idNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{13}$/, 'Please enter a valid ID number']
    }
}, { 
    timestamps: true,
    collection: 'users'
});

export const User = mongoose.model('User', userSchema);