import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.ATLAS_URI, {
    maxPoolSize: 50,
    wtimeoutMS: 2500,
    connectTimeoutMS: 10000
});

let dbConnection;

export const connectToServer = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await client.connect();
        dbConnection = client.db("user");
        console.log('Successfully connected to MongoDB.');
        return true;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

export const getDb = () => {
    if (!dbConnection) {
        throw new Error('Must connect to database first!');
    }
    return dbConnection;
};

// Clean up on application shutdown
process.on('SIGINT', async () => {
    try {
        await client.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});
