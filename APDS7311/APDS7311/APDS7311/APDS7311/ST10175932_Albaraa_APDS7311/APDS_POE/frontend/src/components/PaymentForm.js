import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Input validation functions using RegEx patterns
const validateName = (name) => /^[a-zA-Z ]{2,50}$/.test(name);
const validateBankName = (bank) => /^[a-zA-Z ]{2,50}$/.test(bank);
const validateAccountNumber = (accountNumber) => /^\d{10,20}$/.test(accountNumber);
const validateAmount = (amount) => /^\d+(\.\d{1,2})?$/.test(amount);
const validateSwiftCode = (swiftCode) => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swiftCode);

const PaymentForm = ({ token }) => {
    const [formData, setFormData] = useState({
        recipientName: '',
        recipientBank: '',
        accountNumber: '',
        amount: '',
        swiftCode: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form data
        if (!validateName(formData.recipientName) ||
            !validateBankName(formData.recipientBank) ||
            !validateAccountNumber(formData.accountNumber) ||
            !validateAmount(formData.amount) ||
            !validateSwiftCode(formData.swiftCode)) {
            alert('Please enter valid payment details.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/payment/create', formData, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            console.log('Payment response:', response.data);
            alert('Payment successful!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Payment error:', error.response ? error.response.data : error.message);
            alert(`Payment failed: ${error.response ? error.response.data.message : 'An unexpected error occurred'}`);
        }
    };

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #00b4db, #0083b0)',
        color: 'white',
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        color: 'black',
        width: '400px',
    };

    const inputStyle = {
        padding: '0.5rem',
        marginBottom: '1rem',
        width: '100%',
        border: '1px solid #ccc',
        borderRadius: '4px',
    };

    const buttonStyle = {
        padding: '0.5rem 1rem',
        background: '#0083b0',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    };

    return (
        <div style={containerStyle}>
            <div style={formStyle}>
                <h2>Make a Payment</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            name="recipientName"
                            placeholder="Recipient's Name"
                            value={formData.recipientName}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <input
                            name="recipientBank"
                            placeholder="Recipient's Bank"
                            value={formData.recipientBank}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <input
                            name="accountNumber"
                            placeholder="Account Number"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <input
                            name="amount"
                            type="number"
                            placeholder="Amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <input
                            name="swiftCode"
                            placeholder="SWIFT Code"
                            value={formData.swiftCode}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <button type="submit" style={buttonStyle}>Submit Payment</button>
                </form>
            </div>
        </div>
    );
};

export default PaymentForm;