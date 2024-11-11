import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/conn.mjs';
import { responseHelper } from '../helpers/responseHelper.js';

// Input validation functions
const validateName = (name) => /^[a-zA-Z]{2,30}$/.test(name);
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateUsername = (username) => /^[a-zA-Z0-9]{4,20}$/.test(username);
const validatePassword = (password) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
const validateAccountNumber = (accountNumber) => /^\d{10,12}$/.test(accountNumber);
const validateIdNumber = (idNumber) => /^\d{13}$/.test(idNumber);

// User registration logic
export const registerUser = async (req, res) => {
    const { firstName, lastName, email, username, password, accountNumber, idNumber } = req.body;

    // Input validation
    if (!validateName(firstName) || !validateName(lastName) || 
        !validateEmail(email) || !validateUsername(username) || 
        !validatePassword(password) || !validateAccountNumber(accountNumber) || 
        !validateIdNumber(idNumber)) {
        return responseHelper(res, 400, "Invalid input data");
    }

    try {
        const db = getDb();
        const collection = db.collection("users");

        // Check for existing user
        const existingUser = await collection.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return responseHelper(res, 400, "Email or username already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            username: username.trim(),
            password: hashedPassword,
            accountNumber,
            idNumber,
            createdAt: new Date()
        };

        const result = await collection.insertOne(newUser);
        responseHelper(res, 201, "User registered successfully", { userId: result.insertedId });
    } catch (err) {
        console.error("Registration error:", err);
        responseHelper(res, 500, "Failed to register user", err);
    }
};

// User login logic
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!validateUsername(username) || !validatePassword(password)) {
        return responseHelper(res, 400, "Invalid username or password format");
    }

    try {
        const db = getDb();
        const collection = db.collection("users");

        const user = await collection.findOne({ username });

        if (!user) {
            return responseHelper(res, 401, "Invalid username or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return responseHelper(res, 401, "Invalid username or password");
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Log successful login attempt
        await db.collection("login_logs").insertOne({
            userId: user._id,
            timestamp: new Date(),
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        responseHelper(res, 200, "Login successful", { token });
    } catch (err) {
        console.error("Login error:", err);
        responseHelper(res, 500, "Failed to login user", err);
    }
};