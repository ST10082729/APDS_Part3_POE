import mongoose from '../db/conn.mjs';


const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipientName: String,
    recipientBank: String,
    recipientAccountNo: String,
    amount: Number,
    swiftCode: String,
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);
