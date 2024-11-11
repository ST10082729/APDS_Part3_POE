import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const EmployeeDashboard = ({ token }) => {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await fetch('http://localhost:3000/employee/transactions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch transactions');
            }
            
            setTransactions(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Transaction Dashboard</h1>
                </div>
                
                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <p className="ml-3 text-red-700">{error}</p>
                            </div>
                        </div>
                    )}
                    
                    {loading ? (
                        <div className="text-center p-4">Loading transactions...</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center p-4">No pending transactions</div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map(transaction => (
                                <div key={transaction._id} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <div className="text-sm text-gray-500">Recipient</div>
                                            <div className="font-medium">{transaction.recipientName}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Amount</div>
                                            <div className="font-medium">${transaction.amount.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">SWIFT Code</div>
                                            <div className="font-medium">{transaction.swiftCode}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Status</div>
                                            <div className="flex items-center gap-2">
                                                {transaction.verified ? (
                                                    <>
                                                        <CheckCircle className="text-green-500 h-4 w-4" />
                                                        <span>Verified</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="text-red-500 h-4 w-4" />
                                                        <span>Pending</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
