import { connectToServer, getDb } from '../db/conn.mjs';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const createInitialEmployee = async () => {
    try {
        await connectToServer();
        const db = getDb();
        
        // Check if admin employee exists
        const existingEmployee = await db.collection('employees').findOne({ username: 'admin' });
        
        if (existingEmployee) {
            console.log('Admin employee already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        
        await db.collection('employees').insertOne({
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            active: true,
            createdAt: new Date()
        });

        console.log('Admin employee created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating employee:', error);
        process.exit(1);
    }
};

createInitialEmployee();