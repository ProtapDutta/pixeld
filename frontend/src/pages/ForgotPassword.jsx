// frontend/src/pages/ForgotPassword.jsx (UPDATED)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; // Assuming you have an axios instance configured here
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // Hitting the new backend endpoint
            const res = await api.post('/auth/forgotpassword', { email });
            
            // Backend returns a generic message for security
            setMessage(res.data.message);
            toast.success('Attempted to send reset link. Check your inbox!');
            setEmail(''); // Clear the field on success
        } catch (err) {
            // Note: If the backend successfully hides the error (sends a 200 message), 
            // the catch block won't run unless there's a 500 server error.
            const errorMsg = err.response?.data?.message || 'Server error. Please check configuration.';
            setMessage(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header text-white" style={{ backgroundColor: '#007bff' }}>
                            <h4>Forgot Password</h4>
                        </div>
                        <div className="card-body">
                            {message && (
                                <div className={`alert ${message.includes('sent') ? 'alert-info' : 'alert-danger'} mb-3`} role="alert">
                                    {message}
                                </div>
                            )}
                            <p className="text-muted">Enter the email address associated with your account to receive a password reset link.</p>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        // 💡 ADDED PLACEHOLDER
                                        placeholder="Enter your registered email"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </form>
                            
                            <hr />
                            <div className="text-center">
                                <Link to="/login" className="btn btn-link">Back to Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;