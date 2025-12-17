import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/helpers';

function Register() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        middle_initial: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.first_name || !formData.last_name || !formData.username || 
            !formData.email || !formData.password || !formData.confirmPassword) {
            setError('First name, last name, username, email, and password are required');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { data } = await authAPI.register({
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                middle_initial: formData.middle_initial.trim() || null,
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            if (data.email_sent) {
                showSuccess('Registration successful! Please check your email (including spam folder) to verify your account before logging in.');
            } else {
                showSuccess('Registration successful! Redirecting to login...');
            }
            
            setTimeout(() => {
                navigate('/login');
            }, 4000);
        } catch (error) {
            setError(error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-7 col-xl-6">
                    <div className="card shadow-lg">
                        <div className="card-header bg-success text-white text-center">
                            <h4 className="mb-0">
                                <i className="fas fa-user-plus"></i> Create Account
                            </h4>
                            <p className="mb-0 mt-2" style={{ opacity: 0.9, fontSize: '0.9rem' }}>Join us and get started</p>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="first_name">
                                                <i className="fas fa-user"></i> First Name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="first_name"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="last_name">
                                                <i className="fas fa-user"></i> Last Name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="last_name"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="middle_initial">
                                        <i className="fas fa-user"></i> Middle Initial (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="middle_initial"
                                        name="middle_initial"
                                        value={formData.middle_initial}
                                        onChange={handleChange}
                                        maxLength="5"
                                        placeholder="e.g., A"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="username">
                                        <i className="fas fa-at"></i> Username
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">
                                        <i className="fas fa-envelope"></i> Email
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
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
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">
                                        <i className="fas fa-lock"></i> Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {error && (
                                    <div className="alert alert-danger">{error}</div>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-success btn-block btn-lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-user-plus"></i> Create Account
                                        </>
                                    )}
                                </button>
                            </form>
                            <hr className="my-4" />
                            <div className="text-center">
                                <p className="mb-0">
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-weight-bold">Login here</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;

