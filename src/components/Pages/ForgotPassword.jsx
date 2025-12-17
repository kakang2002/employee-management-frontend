import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/helpers';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email) {
            setError('Email address is required');
            setLoading(false);
            return;
        }

        try {
            const { data } = await authAPI.forgotPassword(email);
            setSuccess(true);
            showSuccess(data.message || 'Password reset link sent! Please check your email.');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to send reset email. Please try again.';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white text-center">
                            <h4><i className="fas fa-key"></i> Forgot Password</h4>
                        </div>
                        <div className="card-body">
                            {success ? (
                                <div>
                                    <div className="alert alert-success">
                                        <i className="fas fa-check-circle"></i> Password reset link has been sent to your email!
                                        <br /><br />
                                        <small>Please check your inbox (and spam folder) for the reset link.</small>
                                    </div>
                                    <div className="text-center">
                                        <Link to="/login" className="btn btn-primary">
                                            <i className="fas fa-arrow-left"></i> Back to Login
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-muted">
                                        Enter your email address and we'll send you a link to reset your password.
                                        <br /><br />
                                        <small><strong>Note:</strong> Your email must be verified to reset your password.</small>
                                    </p>
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group">
                                            <label htmlFor="email">
                                                <i className="fas fa-envelope"></i> Email Address
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                placeholder="Enter your registered email"
                                            />
                                        </div>
                                        {error && (
                                            <div className="alert alert-danger">
                                                <i className="fas fa-exclamation-circle"></i> {error}
                                            </div>
                                        )}
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-block"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin"></i> Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-paper-plane"></i> Send Reset Link
                                                </>
                                            )}
                                        </button>
                                    </form>
                                    <hr />
                                    <div className="text-center">
                                        <Link to="/login" className="text-primary">
                                            <i className="fas fa-arrow-left"></i> Back to Login
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;

