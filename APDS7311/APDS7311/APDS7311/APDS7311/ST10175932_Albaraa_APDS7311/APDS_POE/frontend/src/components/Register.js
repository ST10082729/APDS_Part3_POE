import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        accountNumber: '',
        idNumber: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'password') {
            validatePassword(e.target.value);
        }
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!regex.test(password)) {
            setPasswordError('Password must be at least 8 characters long and contain both letters and numbers.');
        } else {
            setPasswordError('');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (passwordError) {
            alert('Please fix the password issues before submitting.');
            return;
        }
        try {
            const response = await axios.post('http://localhost:3000/user/signup', formData);
            console.log('Registration response:', response.data);
            alert('Registration successful!');
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error.response ? error.response.data : error.message);
            alert(`Registration failed: ${error.response ? error.response.data.message : 'An unexpected error occurred'}`);
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

    const linkStyle = {
        color: '#0083b0',
        textDecoration: 'none',
    };

    return (
        <div style={containerStyle}>
            <div style={formStyle}>
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                    <div><input name="firstName" placeholder="First Name" onChange={handleChange} style={inputStyle} /></div>
                    <div><input name="lastName" placeholder="Last Name" onChange={handleChange} style={inputStyle} /></div>
                    <div><input name="email" placeholder="Email Address" onChange={handleChange} style={inputStyle} /></div>
                    <div><input name="username" placeholder="Username" onChange={handleChange} style={inputStyle} /></div>
                    <div>
                        <input name="password" type="password" placeholder="Password" onChange={handleChange} style={inputStyle} />
                        {passwordError && <p style={{color: 'red'}}>{passwordError}</p>}
                    </div>
                    <div><input name="accountNumber" placeholder="Account Number" onChange={handleChange} style={inputStyle} /></div>
                    <div><input name="idNumber" placeholder="ID Number" onChange={handleChange} style={inputStyle} /></div>
                    <button type="submit" style={buttonStyle}>Register</button>
                </form>
                <p>
                    Already have an account? <a href="/login" style={linkStyle}>Login here</a>
                </p>
            </div>
        </div>
    );
};

export default Register;