import React, { useState } from 'react';
import { AlertCircle, Send, CheckCircle } from 'lucide-react';

const SwiftSubmission = ({ transactions, token, onSubmissionComplete }) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [selectedTransactions, setSelectedTransactions] = useState([]);

    const handleSubmitToSwift = async () => {
        if (selectedTransactions.length === 0) {
            setError('Please select transactions to submit');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3000/employee/submit-swift', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    transactionIds: selectedTransactions
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Submission failed');
            }

            onSubmissionComplete(selectedTransactions);
            setSelectedTransactions([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleTransaction = (transactionId) => {
        setSelectedTransactions(prev => 
            prev.includes(transactionId)
                ? prev.filter(id => id !== transactionId)
                : [...prev, transactionId]
        );
    };

    return (
        <div className="w-full bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Submit to SWIFT</h2>
            </div>
            
            <div className="p-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        {transactions.filter(t => t.verified && !t.submitted).map(transaction => (
                            <div 
                                key={transaction._id}
                                className="flex items-center p-4 border rounded-md hover:bg-gray-50 cursor-pointer"
                                onClick={() => toggleTransaction(transaction._id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTransactions.includes(transaction._id)}
                                    onChange={() => toggleTransaction(transaction._id)}
                                    className="mr-4 h-4 w-4"
                                />
                                <div className="flex-1 grid grid-cols-3 gap-4">
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
                                </div>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <p className="ml-3 text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmitToSwift}
                            disabled={submitting || selectedTransactions.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                            {submitting ? 'Submitting...' : 'Submit to SWIFT'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SwiftSubmission;
