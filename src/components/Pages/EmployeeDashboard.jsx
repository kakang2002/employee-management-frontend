import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { employeeServiceAPI, authAPI } from '../../services/api';
import { showError, showSuccess, formatDate, getCurrentUser } from '../../utils/helpers';
import TimeInOut from '../Features/TimeInOut';

function EmployeeDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const { data } = await employeeServiceAPI.dashboard();
            setDashboardData(data);
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

    const { employee, today_attendance } = dashboardData || {};

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
                    <h2 className="mb-0"><i className="fas fa-user-circle"></i> Employee Dashboard</h2>
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
                                    : (employee?.image
                                        ? `/uploads/${employee.image}`
                                        : 'https://via.placeholder.com/40x40?text=EMP')}
                                alt={currentUser.username}
                                className="rounded-circle mr-2"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/40x40?text=EMP';
                                }}
                            />
                            <div className="text-right">
                                <div style={{ fontWeight: 600 }}>
                                    {currentUser.first_name || employee?.firstname || currentUser.username}
                                </div>
                                <small className="text-muted text-uppercase">{currentUser.role}</small>
                            </div>
                        </div>
                    )}
                    <button 
                        className="btn btn-danger btn-sm" 
                        onClick={handleLogout}
                        style={{ fontWeight: 600 }}
                    >
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>

            {/* Time In/Out Section */}
            <div className="row mb-4">
                <div className="col-md-12">
                    <TimeInOut 
                        attendance={today_attendance} 
                        onUpdate={loadDashboard}
                    />
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
                                <div className="col-md-4 mb-3">
                                    <a href="/employee/attendance" className="btn btn-outline-primary btn-block">
                                        <i className="fas fa-history"></i> Attendance History
                                    </a>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <Link to="/employee/leave-request" className="btn btn-outline-success btn-block">
                                        <i className="fas fa-calendar-plus"></i> Request Leave
                                    </Link>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <a href="/employee/payslips" className="btn btn-outline-info btn-block">
                                        <i className="fas fa-file-invoice"></i> My Payslips
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

export default EmployeeDashboard;

