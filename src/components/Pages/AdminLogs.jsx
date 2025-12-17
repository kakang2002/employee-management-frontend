import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { showError, formatDate, formatDateTime } from '../../utils/helpers';

function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        user_id: '',
        action: '',
        date_from: '',
        date_to: ''
    });

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.user_id) params.user_id = filters.user_id;
            if (filters.action) params.action = filters.action;
            if (filters.date_from) params.date_from = filters.date_from;
            if (filters.date_to) params.date_to = filters.date_to;
            
            const { data } = await adminAPI.getLogs(params);
            setLogs(data.data || data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load system logs');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        loadLogs();
    };

    const getActionBadge = (action) => {
        const badges = {
            user_created: 'success',
            user_updated: 'info',
            user_deactivated: 'warning',
            employee_created: 'success',
            employee_updated: 'info',
            leave_approved: 'success',
            leave_rejected: 'danger',
            payroll_generated: 'primary'
        };
        return badges[action] || 'secondary';
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Link to="/admin/dashboard" className="btn btn-secondary mr-3">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                    <h2 className="mb-0"><i className="fas fa-history"></i> System Logs</h2>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={handleFilter} className="row">
                        <div className="col-md-3">
                            <label>Action</label>
                            <input
                                type="text"
                                className="form-control"
                                value={filters.action}
                                onChange={(e) => setFilters({...filters, action: e.target.value})}
                                placeholder="e.g., user_created"
                            />
                        </div>
                        <div className="col-md-3">
                            <label>Date From</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filters.date_from}
                                onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                            />
                        </div>
                        <div className="col-md-3">
                            <label>Date To</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filters.date_to}
                                onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                            />
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                            <button type="submit" className="btn btn-primary mr-2">
                                <i className="fas fa-filter"></i> Filter
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setFilters({ user_id: '', action: '', date_from: '', date_to: '' });
                                    loadLogs();
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Logs Table */}
            <div className="card">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0">System Activity Log</h5>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : logs.length === 0 ? (
                        <p className="text-muted text-center">No logs found</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Description</th>
                                        <th>IP Address</th>
                                        <th>Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id}>
                                            <td>{log.user?.username || 'System'}</td>
                                            <td>
                                                <span className={`badge badge-${getActionBadge(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>{log.description || '-'}</td>
                                            <td>{log.ip_address || '-'}</td>
                                            <td>{formatDateTime(log.created_at)}</td>
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

export default AdminLogs;

