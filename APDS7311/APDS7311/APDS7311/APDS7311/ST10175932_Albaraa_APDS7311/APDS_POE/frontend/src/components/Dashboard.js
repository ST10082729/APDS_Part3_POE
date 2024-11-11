import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = ({ token }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('http://localhost:3000/payment/transactions', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTransactions(response.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setError('Failed to load transactions');
                setLoading(false);
            }
        };

        if (token) {
            fetchTransactions();
        }
    }, [token]);

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #00b4db, #0083b0)',
        color: 'white',
    };

    const contentStyle = {
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        color: 'black',
        width: '400px',
    };

    const formatAmount = (amount) => {
        // Handle different types of amount values
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={contentStyle}>
                    <h2>Loading transactions...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={containerStyle}>
                <div style={contentStyle}>
                    <h2>Error</h2>
                    <p>{error}</p>
                    <Link to="/payment" style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        background: '#0083b0',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                    }}>Make a Payment</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                <h2>Dashboard</h2>
                <h3>Transaction History</h3>
                {transactions.length === 0 ? (
                    <p>No transactions found</p>
                ) : (
                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        marginBottom: '1rem',
                    }}>
                        {transactions.map((transaction) => (
                            <li key={transaction._id} style={{
                                padding: '0.5rem',
                                borderBottom: '1px solid #ccc',
                            }}>
                                {transaction.recipientName} - ${formatAmount(transaction.amount)}
                            </li>
                        ))}
                    </ul>
                )}
                <Link to="/payment" style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: '#0083b0',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                }}>Make a Payment</Link>
            </div>
        </div>
    );
};

export default Dashboard;
