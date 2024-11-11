import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/user/login', {
                username,
                password,
            });

            console.log('Login response:', response.data);
            onLogin(response.data.token);
            alert('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error.response ? error.response.data : error.message);
            alert(`Login failed: ${error.response ? error.response.data.message : 'An unexpected error occurred'}`);
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
        width: '300px',
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

    const linkStyle = {
        color: '#0083b0',
        textDecoration: 'none',
    };

    return (
        <div style={containerStyle}>
            <div style={formStyle}>
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <button type="submit" style={buttonStyle}>Login</button>
                </form>
                <p>
                    Don't have an account? <a href="/register" style={linkStyle}>Sign up here</a>
                </p>
            </div>
        </div>
    );
};

export default Login;