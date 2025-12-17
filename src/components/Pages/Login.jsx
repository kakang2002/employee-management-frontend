import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/helpers';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [errorElement, setErrorElement] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const verified = searchParams.get('verified');
        if (verified === 'success') {
            setVerificationMessage('Email verified successfully! You can now login.');
        } else if (verified === 'error') {
            setError('Invalid verification link. Please try again or contact support.');
            setErrorElement(null);
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setErrorElement(null);
        setLoading(true);

        if (!username || !password) {
            setError('Username and password are required');
            setErrorElement(null);
            setLoading(false);
            return;
        }

        try {
            const { data } = await authAPI.login({ username, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showSuccess('Login successful! Redirecting...');
            
            // Use redirect_to from API response, or default based on role
            const redirectPath = data.redirect_to || getDefaultRedirectPath(data.user?.role);
            
            console.log('Login redirect path:', redirectPath);
            console.log('User role:', data.user?.role);
            console.log('Redirect to from API:', data.redirect_to);
            
            // Use window.location for a hard redirect to ensure the route guard picks up the new auth state
            // Redirect immediately without delay
            window.location.href = redirectPath;
        } catch (err) {
            // Clear previous errors
            setError('');
            setErrorElement(null);
            
            // Extract error message from different error types
            let errorMessage = 'Login failed. Please try again.';
            
            if (err.response) {
                // Server responded with error status
                errorMessage = err.response.data?.error || err.response.data?.message || errorMessage;
                
                if (err.response.data?.email_verified === false) {
                    const email = err.response.data.email || '';
                    setErrorElement(
                        <div>
                            {errorMessage}
                            <br /><br />
                            <button
                                className="btn btn-sm btn-warning mt-2"
                                onClick={() => resendVerification(email)}
                            >
                                <i className="fas fa-envelope"></i> Resend Verification Email
                            </button>
                        </div>
                    );
                    return;
                }
            } else if (err.request) {
                // Request was made but no response received
                errorMessage = 'Network error. Please check your connection and try again.';
            } else {
                // Something else happened
                errorMessage = err.message || errorMessage;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getDefaultRedirectPath = (role) => {
        console.log('getDefaultRedirectPath called with role:', role);
        switch (role) {
            case 'admin':
                return '/admin/dashboard';
            case 'hr_manager':
                return '/hr/dashboard';
            case 'employee':
                return '/employee/dashboard';
            default:
                return '/profile';
        }
    };

    const resendVerification = async (email) => {
        if (!email) {
            showError('Email address not found');
            return;
        }

        try {
            const { data } = await authAPI.resendVerification(email);
            showSuccess(data.message || 'Verification email sent! Please check your inbox (and spam folder).');
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to resend email. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
                <div className="col-md-6 col-lg-5 col-xl-4">
                    {verificationMessage && (
                        <div className="alert alert-success alert-dismissible fade show mb-4">
                            <i className="fas fa-check-circle"></i> {verificationMessage}
                            <button
                                type="button"
                                className="close"
                                onClick={() => setVerificationMessage('')}
                            >
                                <span>&times;</span>
                            </button>
                        </div>
                    )}

                    <div className="card shadow-lg">
                        <div className="card-header bg-primary text-white text-center">
                            <h4 className="mb-0">
                                <i className="fas fa-sign-in-alt"></i> Welcome Back
                            </h4>
                            <p className="mb-0 mt-2" style={{ opacity: 0.9, fontSize: '0.9rem' }}>Sign in to your account</p>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="username">
                                        <i className="fas fa-user"></i> Username
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">
                                        <i className="fas fa-lock"></i> Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                                {error && (
                                    <div className="alert alert-danger">
                                        {error}
                                    </div>
                                )}
                                {errorElement && (
                                    <div className="alert alert-danger">
                                        {errorElement}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block btn-lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-sign-in-alt"></i> Sign In
                                        </>
                                    )}
                                </button>
                            </form>
                            {/* Footer links removed: no self-service registration or password reset */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

