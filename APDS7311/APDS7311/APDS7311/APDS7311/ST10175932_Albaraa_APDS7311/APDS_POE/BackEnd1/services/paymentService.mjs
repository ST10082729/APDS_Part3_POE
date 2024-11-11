export const validatePayment = ({ recipientName, recipientBank, accountNumber, amount, swiftCode }) => {
    if (!recipientName || !recipientBank || !accountNumber || !amount || !swiftCode) {
      return { isValid: false, message: 'All fields are required' };
    }
    if (isNaN(amount) || amount <= 0) {
      return { isValid: false, message: 'Invalid amount' };
    }
    return { isValid: true };
};

export const processPayment = async ({ recipientName, recipientBank, accountNumber, amount, swiftCode }) => {
    return {
      paymentId: Math.floor(Math.random() * 1000000)  // Simulated payment ID
 };
};