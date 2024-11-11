import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PaymentForm from './components/PaymentForm';
import EmployeeLogin from './components/EmployeeLogin';
import EmployeeDashboard from './components/EmployeeDashboard';

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
    const navigate = useNavigate();

    const handleLogin = (newToken, role) => {
        setToken(newToken);
        setUserRole(role);
        localStorage.setItem('token', newToken);
        localStorage.setItem('userRole', role);
        
        // Redirect based on role
        if (role === 'employee') {
            navigate('/employee/dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    const handleLogout = () => {
        setToken(null);
        setUserRole(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    // Protected Route Component
    const ProtectedRoute = ({ children, allowedRole }) => {
        if (!token || userRole !== allowedRole) {
            return <Navigate to={allowedRole === 'employee' ? '/employee/login' : '/login'} />;
        }
        return children;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation Bar */}
            <nav className="bg-blue-600 text-white p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="font-bold text-xl">
                        {userRole === 'employee' ? 'Employee Portal' : 'Banking Portal'}
                    </div>
                    <div className="flex gap-4">
                        {!token ? (
                            <>
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="text-white hover:text-blue-200"
                                >
                                    Customer Login
                                </button>
                                <button 
                                    onClick={() => navigate('/employee/login')}
                                    className="text-white hover:text-blue-200"
                                >
                                    Employee Login
                                </button>
                            </>
                        ) : userRole === 'employee' ? (
                            <>
                                <button 
                                    onClick={() => navigate('/employee/dashboard')}
                                    className="text-white hover:text-blue-200"
                                >
                                    Dashboard
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="text-white hover:text-blue-200"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="text-white hover:text-blue-200"
                                >
                                    Dashboard
                                </button>
                                <button 
                                    onClick={() => navigate('/payment')}
                                    className="text-white hover:text-blue-200"
                                >
                                    Make Payment
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="text-white hover:text-blue-200"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Routes */}
            <div className="max-w-7xl mx-auto p-4">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login onLogin={(token) => handleLogin(token, 'customer')} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/employee/login" element={<EmployeeLogin onLogin={(token) => handleLogin(token, 'employee')} />} />
                    
                    {/* Protected Customer Routes */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute allowedRole="customer">
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/payment" 
                        element={
                            <ProtectedRoute allowedRole="customer">
                                <PaymentForm />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Protected Employee Routes */}
                    <Route 
                        path="/employee/dashboard" 
                        element={
                            <ProtectedRoute allowedRole="employee">
                                <EmployeeDashboard />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </div>
        </div>
    );
};

export default App;
