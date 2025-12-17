import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '../../utils/helpers';
import { authAPI } from '../../services/api';
import { showSuccess } from '../../utils/helpers';

function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            if (isAuthenticated()) {
                const currentUser = getCurrentUser();
                setUser(currentUser);
            } else {
                setUser(null);
            }
        };
        
        // Check immediately
        checkAuth();
        
        // Also listen for storage changes (when user logs in/out in another tab or component)
        const handleStorageChange = () => {
            checkAuth();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Check auth state periodically to update navbar when user logs in/out
        const interval = setInterval(checkAuth, 500);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Also check on mount and when navigating
    useEffect(() => {
        if (isAuthenticated()) {
            setUser(getCurrentUser());
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            showSuccess('Logged out successfully');
            navigate('/login');
        }
    };

    // Always check auth state directly from localStorage for render
    // This ensures the navbar is always up to date
    const token = localStorage.getItem('token');
    const isAuth = !!token;
    const currentUser = isAuth ? getCurrentUser() : null;
    const displayUser = user || currentUser;
    
    // If we have a token but no user object, create a minimal user object
    const showAuthMenu = isAuth || !!displayUser;
    const username = displayUser?.username || (isAuth ? 'User' : null);

    // Build profile image URL for navbar avatar
    const profileImageUrl = displayUser?.profile_picture && displayUser.profile_picture !== 'null' && displayUser.profile_picture !== ''
        ? `/uploads/${displayUser.profile_picture}`
        : null;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ position: 'relative', zIndex: 1000 }}>
            <div className="container">
                <Link className="navbar-brand" to="/">
                    <i className="fas fa-users"></i> Employee Management
                </Link>
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-toggle="collapse" 
                    data-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse show" id="navbarNav">
                    <ul className="navbar-nav ml-auto align-items-center">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        {showAuthMenu ? (
                            <>
                                {/* Role-based navigation */}
                                {displayUser?.role === 'admin' && (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/admin/dashboard">
                                                <i className="fas fa-tachometer-alt"></i> Dashboard
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/admin/users">
                                                <i className="fas fa-users-cog"></i> Users
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/admin/employees">
                                                <i className="fas fa-users"></i> Employees
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/admin/attendance">
                                                <i className="fas fa-clock"></i> Attendance
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/admin/payroll">
                                                <i className="fas fa-money-bill-wave"></i> Payroll
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/admin/logs">
                                                <i className="fas fa-history"></i> Logs
                                            </Link>
                                        </li>
                                    </>
                                )}
                                {(displayUser?.role === 'hr_manager' || displayUser?.role === 'admin') && (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/hr/dashboard">
                                                <i className="fas fa-briefcase"></i> HR Dashboard
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/hr/employees">
                                                <i className="fas fa-users"></i> Employees
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/hr/attendance">
                                                <i className="fas fa-clock"></i> Attendance
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/hr/time-settings">
                                                <i className="fas fa-cog"></i> Time Settings
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/hr/leave-requests">
                                                <i className="fas fa-calendar-check"></i> Leave Requests
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/hr/payroll">
                                                <i className="fas fa-money-bill-wave"></i> Payroll
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/hr/reports">
                                                <i className="fas fa-chart-bar"></i> Reports
                                            </Link>
                                        </li>
                                    </>
                                )}
                                {(displayUser?.role === 'employee' || displayUser?.role === 'hr_manager' || displayUser?.role === 'admin') && (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/employee/dashboard">
                                                <i className="fas fa-user-circle"></i> My Dashboard
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/employee/attendance">
                                                <i className="fas fa-history"></i> Attendance
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/employee/leave-request">
                                                <i className="fas fa-calendar-plus"></i> Request Leave
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/employee/leave-requests">
                                                <i className="fas fa-calendar-check"></i> My Leave Requests
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/employee/payslips">
                                                <i className="fas fa-file-invoice"></i> Payslips
                                            </Link>
                                        </li>
                                    </>
                                )}
                                {username && (
                                    <li className="nav-item d-flex align-items-center">
                                        {profileImageUrl ? (
                                            <img
                                                src={profileImageUrl}
                                                alt={username}
                                                className="rounded-circle mr-2"
                                                style={{ width: '32px', height: '32px', objectFit: 'cover', border: '2px solid #fff' }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <i className="fas fa-user-circle mr-2" style={{ fontSize: '1.4rem', color: '#ddd' }}></i>
                                        )}
                                        <span className="navbar-text mb-0" style={{ color: 'rgba(255,255,255,.9)', fontSize: '0.95rem', fontWeight: 500 }}>
                                            {username}
                                            {displayUser?.role && (
                                                <span className="badge badge-light ml-2 text-uppercase">{displayUser.role}</span>
                                            )}
                                        </span>
                                    </li>
                                )}
                                <li className="nav-item">
                                    <Link className="btn btn-outline-light mr-2" to="/profile" style={{ fontWeight: 600 }}>
                                        <i className="fas fa-user"></i> Profile
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className="btn btn-danger" 
                                        onClick={handleLogout}
                                        type="button"
                                        style={{ 
                                            fontWeight: 600,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        <i className="fas fa-sign-out-alt"></i> Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item" id="auth-buttons">
                                <Link className="btn btn-outline-light mr-2" to="/login" style={{ fontWeight: 600 }}>
                                    <i className="fas fa-sign-in-alt"></i> Login
                                </Link>
                                <Link className="btn btn-primary" to="/register" style={{ fontWeight: 600 }}>
                                    <i className="fas fa-user-plus"></i> Register
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

