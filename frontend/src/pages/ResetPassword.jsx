// frontend/src/pages/ResetPassword.jsx (NEW FILE)

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios'; // Assuming you have an axios instance configured here
import { toast } from 'react-toastify';

const ResetPassword = () => {
    // Get the token from the URL (e.g., /reset-password/123456abcdef)
    const { token } = useParams(); 
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            // 1. Submit the new password and the token via a PUT request to the backend endpoint
            await api.put(`/auth/resetpassword/${token}`, { password });
            
            toast.success('Password successfully reset! You can now log in with your new password.');
            
            // 2. Redirect to the login page
            navigate('/login');
        } catch (err) {
            // Handle errors like 'Invalid or expired token'
            const errorMsg = err.response?.data?.message || 'Password reset failed. Please request a new link.';
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
                            <h4>Set New Password</h4>
                        </div>
                        <div className="card-body">
                            <p className="text-muted">Enter and confirm your new password below. Token: **{token.substring(0, 8)}...**</p>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <button type="submit" className="btn btn-success w-100" disabled={loading || !password || !confirmPassword}>
                                    {loading ? 'Updating Password...' : 'Reset Password'}
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

export default ResetPassword;