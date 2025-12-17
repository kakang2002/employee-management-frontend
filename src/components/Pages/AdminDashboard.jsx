import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI, authAPI } from '../../services/api';
import { showError, showSuccess, formatDate, formatCurrency, getCurrentUser } from '../../utils/helpers';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const { data } = await adminAPI.dashboard();
            setStats(data.statistics);
            setRecentLogs(data.recent_activities || []);
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
                    <h2 className="mb-0"><i className="fas fa-tachometer-alt"></i> Admin Dashboard</h2>
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
                                    : 'https://via.placeholder.com/40x40?text=User'}
                                alt={currentUser.username}
                                className="rounded-circle mr-2"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/40x40?text=User';
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
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-subtitle mb-2">Total Employees</h6>
                                    <h3 className="mb-0">{stats?.total_employees || 0}</h3>
                                </div>
                                <i className="fas fa-users fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-subtitle mb-2">Total Users</h6>
                                    <h3 className="mb-0">{stats?.total_users || 0}</h3>
                                </div>
                                <i className="fas fa-user-friends fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card bg-info text-white">
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
                    <div className="card bg-warning text-white">
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
            </div>

            <div className="row mb-4">
                <div className="col-md-6 mb-3">
                    <div className="card bg-secondary text-white">
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
                <div className="col-md-6 mb-3">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-subtitle mb-2">Processed Payroll</h6>
                                    <h3 className="mb-0">{stats?.processed_payroll || 0}</h3>
                                </div>
                                <i className="fas fa-check-double fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="row mb-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0"><i className="fas fa-bolt"></i> Quick Actions</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <Link to="/admin/users" className="btn btn-outline-primary btn-block btn-lg" style={{ textDecoration: 'none' }}>
                                        <i className="fas fa-users-cog fa-2x mb-2 d-block"></i>
                                        <strong>Manage Users</strong>
                                        <br />
                                        <small>Create, Edit, Deactivate</small>
                                    </Link>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Link to="/admin/employees" className="btn btn-outline-success btn-block btn-lg" style={{ textDecoration: 'none' }}>
                                        <i className="fas fa-users fa-2x mb-2 d-block"></i>
                                        <strong>Manage Employees</strong>
                                        <br />
                                        <small>Add, Edit, Delete</small>
                                    </Link>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Link to="/admin/attendance" className="btn btn-outline-info btn-block btn-lg" style={{ textDecoration: 'none' }}>
                                        <i className="fas fa-clock fa-2x mb-2 d-block"></i>
                                        <strong>View Attendance</strong>
                                        <br />
                                        <small>All Records</small>
                                    </Link>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Link to="/admin/payroll" className="btn btn-outline-warning btn-block btn-lg" style={{ textDecoration: 'none' }}>
                                        <i className="fas fa-money-bill-wave fa-2x mb-2 d-block"></i>
                                        <strong>View Payroll</strong>
                                        <br />
                                        <small>All Records</small>
                                    </Link>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col-md-3 mb-3">
                                    <Link to="/admin/logs" className="btn btn-outline-dark btn-block btn-lg" style={{ textDecoration: 'none' }}>
                                        <i className="fas fa-history fa-2x mb-2 d-block"></i>
                                        <strong>System Logs</strong>
                                        <br />
                                        <small>Audit Trail</small>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0"><i className="fas fa-history"></i> Recent System Activities</h5>
                </div>
                <div className="card-body">
                    {recentLogs.length === 0 ? (
                        <p className="text-muted text-center">No recent activities</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Description</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td>{log.user?.username || 'System'}</td>
                                            <td><span className="badge badge-info">{log.action}</span></td>
                                            <td>{log.description}</td>
                                            <td>{formatDate(log.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;

