import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/conn.mjs';

const router = express.Router();

// Input validation functions using RegEx patterns
const validateName = (name) => /^[a-zA-Z]{2,30}$/.test(name);
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateUsername = (username) => /^[a-zA-Z0-9]{4,20}$/.test(username);
const validatePassword = (password) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
const validateAccountNumber = (accountNumber) => /^\d{10,12}$/.test(accountNumber);
const validateIdNumber = (idNumber) => /^\d{13}$/.test(idNumber);

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, username, password, accountNumber, idNumber } = req.body;

        // Input validation
        if (!validateName(firstName) || !validateName(lastName)) {
            return res.status(400).json({ message: "Invalid name format" });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (!validateUsername(username)) {
            return res.status(400).json({ message: "Invalid username format" });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ message: "Invalid password format" });
        }
        if (!validateAccountNumber(accountNumber)) {
            return res.status(400).json({ message: "Invalid account number format" });
        }
        if (!validateIdNumber(idNumber)) {
            return res.status(400).json({ message: "Invalid ID number format" });
        }

        const db = getDb();
        const collection = db.collection("users");
        
        // Check if user already exists
        const existingUser = await collection.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email or username already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
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
        res.status(201).json({ 
            message: "User registered successfully", 
            userId: result.insertedId 
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ 
            message: "Registration failed", 
            error: error.message 
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Input validation
        if (!validateUsername(username) || !validatePassword(password)) {
            return res.status(400).json({ message: "Invalid username or password format" });
        }

        const db = getDb();
        const collection = db.collection("users");

        const user = await collection.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            message: "Login successful", 
            token,
            userId: user._id
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            message: "Login failed", 
            error: error.message 
        });
    }
});

export default router;