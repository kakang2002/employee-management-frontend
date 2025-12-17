import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeeServiceAPI } from '../../services/api';
import { showError, formatDate } from '../../utils/helpers';

function EmployeeLeaveRequests() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadLeaveRequests();
    }, [filter]);

    const loadLeaveRequests = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const { data } = await employeeServiceAPI.getLeaveRequests(params);
            setLeaveRequests(data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'warning',
            approved: 'success',
            rejected: 'danger',
            cancelled: 'secondary'
        };
        return badges[status] || 'secondary';
    };

    const getLeaveTypeLabel = (type) => {
        const labels = {
            sick: 'Sick Leave',
            vacation: 'Vacation Leave',
            personal: 'Personal Leave',
            emergency: 'Emergency Leave',
            other: 'Other'
        };
        return labels[type] || type;
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Link to="/employee/dashboard" className="btn btn-secondary mr-3">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                    <h2 className="mb-0"><i className="fas fa-calendar-check"></i> My Leave Requests</h2>
                </div>
                <div>
                    <Link to="/employee/leave-request" className="btn btn-primary">
                        <i className="fas fa-plus"></i> New Leave Request
                    </Link>
                    <select
                        className="form-control ml-2 d-inline-block"
                        style={{ width: 'auto' }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : leaveRequests.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                            <h5>No leave requests found</h5>
                            <p className="text-muted">You haven't submitted any leave requests yet.</p>
                            <a href="/employee/leave-request" className="btn btn-primary">
                                <i className="fas fa-plus"></i> Submit Leave Request
                            </a>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Leave Type</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Days</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaveRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td>{getLeaveTypeLabel(request.leave_type)}</td>
                                            <td>{formatDate(request.start_date)}</td>
                                            <td>{formatDate(request.end_date)}</td>
                                            <td>{request.days_requested}</td>
                                            <td>
                                                <small>{request.reason.substring(0, 50)}...</small>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${getStatusBadge(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td>{formatDate(request.created_at)}</td>
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

export default EmployeeLeaveRequests;

