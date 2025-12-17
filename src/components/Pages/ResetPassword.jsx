import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/helpers';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const urlToken = searchParams.get('token');
        const urlEmail = searchParams.get('email');
        
        if (!urlToken || !urlEmail) {
            setError('Invalid reset link. Please request a new password reset.');
        } else {
            setToken(urlToken);
            setEmail(urlEmail);
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!password || !passwordConfirmation) {
            setError('Both password fields are required');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            return;
        }

        if (!token || !email) {
            setError('Invalid reset link. Please request a new password reset.');
            return;
        }

        setLoading(true);

        try {
            const { data } = await authAPI.resetPassword({
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            setSuccess(true);
            showSuccess(data.message || 'Password reset successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to reset password. Please try again.';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div className="card shadow">
                            <div className="card-header bg-danger text-white text-center">
                                <h4><i className="fas fa-exclamation-triangle"></i> Invalid Link</h4>
                            </div>
                            <div className="card-body">
                                <div className="alert alert-danger">
                                    <i className="fas fa-exclamation-circle"></i> Invalid or missing reset link parameters.
                                </div>
                                <div className="text-center">
                                    <Link to="/forgot-password" className="btn btn-primary">
                                        Request New Reset Link
                                    </Link>
                                    <br /><br />
                                    <Link to="/login" className="text-primary">
                                        <i className="fas fa-arrow-left"></i> Back to Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white text-center">
                            <h4><i className="fas fa-key"></i> Reset Password</h4>
                        </div>
                        <div className="card-body">
                            {success ? (
                                <div>
                                    <div className="alert alert-success">
                                        <i className="fas fa-check-circle"></i> Password reset successfully!
                                        <br /><br />
                                        <small>Redirecting to login page...</small>
                                    </div>
                                    <div className="text-center">
                                        <Link to="/login" className="btn btn-primary">
                                            <i className="fas fa-sign-in-alt"></i> Go to Login
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-muted">
                                        Enter your new password below. Make sure it's at least 6 characters long.
                                    </p>
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group">
                                            <label htmlFor="password">
                                                <i className="fas fa-lock"></i> New Password
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength="6"
                                                placeholder="Enter new password"
                                            />
                                            <small className="form-text text-muted">Must be at least 6 characters</small>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="passwordConfirmation">
                                                <i className="fas fa-lock"></i> Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="passwordConfirmation"
                                                value={passwordConfirmation}
                                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                                required
                                                minLength="6"
                                                placeholder="Confirm new password"
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
                                                    <i className="fas fa-spinner fa-spin"></i> Resetting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save"></i> Reset Password
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

export default ResetPassword;

