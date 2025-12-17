import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { hrAPI, authAPI } from '../../services/api';
import { showError, showSuccess, formatDate, getCurrentUser } from '../../utils/helpers';

function HRDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const { data } = await hrAPI.dashboard();
            setStats(data.statistics);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const currentUser = getCurrentUser();

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showSuccess('Logged out successfully');
            window.location.href = '/login';
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <h2 className="mb-0"><i className="fas fa-briefcase"></i> HR Manager Dashboard</h2>
                </div>
                <div className="d-flex align-items-center">
                    {currentUser && (
                        <div
                            className="d-flex align-items-center mr-3"
                            role="button"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/profile')}
                        >
                            <img
                                src={currentUser.profile_picture && currentUser.profile_picture !== 'null' && currentUser.profile_picture !== ''
                                    ? `/uploads/${currentUser.profile_picture}`
                                    : 'https://via.placeholder.com/40x40?text=HR'}
                                alt={currentUser.username}
                                className="rounded-circle mr-2"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/40x40?text=HR';
                                }}
                            />
                            <div className="text-right">
                                <div style={{ fontWeight: 600 }}>{currentUser.first_name || currentUser.username}</div>
                                <small className="text-muted text-uppercase">{currentUser.role}</small>
                            </div>
                        </div>
                    )}
                    <button 
                        className="btn btn-danger" 
                        onClick={handleLogout}
                        style={{ fontWeight: 600 }}
                    >
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-subtitle mb-2">Present Today</h6>
                                    <h3 className="mb-0">{stats?.present_today || 0}</h3>
                                </div>
                                <i className="fas fa-check-circle fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card bg-danger text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-subtitle mb-2">Absent Today</h6>
                                    <h3 className="mb-0">{stats?.absent_today || 0}</h3>
                                </div>
                                <i className="fas fa-times-circle fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card bg-warning text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-subtitle mb-2">Pending Leave Requests</h6>
                                    <h3 className="mb-0">{stats?.pending_leaves || 0}</h3>
                                </div>
                                <i className="fas fa-calendar-times fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-subtitle mb-2">Pending Payroll</h6>
                                    <h3 className="mb-0">{stats?.pending_payroll || 0}</h3>
                                </div>
                                <i className="fas fa-file-invoice-dollar fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0"><i className="fas fa-bolt"></i> Quick Actions</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <a href="/hr/employees" className="btn btn-outline-primary btn-block">
                                        <i className="fas fa-users"></i> Manage Employees
                                    </a>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <a href="/hr/attendance" className="btn btn-outline-success btn-block">
                                        <i className="fas fa-clock"></i> View Attendance
                                    </a>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <a href="/hr/leave-requests" className="btn btn-outline-warning btn-block">
                                        <i className="fas fa-calendar-check"></i> Leave Requests
                                    </a>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <a href="/hr/payroll" className="btn btn-outline-info btn-block">
                                        <i className="fas fa-money-bill-wave"></i> Payroll
                                    </a>
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col-md-3 mb-3">
                                    <a href="/hr/time-settings" className="btn btn-outline-secondary btn-block">
                                        <i className="fas fa-cog"></i> Time Settings
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HRDashboard;

