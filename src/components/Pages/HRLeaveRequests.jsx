import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hrAPI } from '../../services/api';
import { showSuccess, showError, formatDate } from '../../utils/helpers';

function HRLeaveRequests() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadLeaveRequests();
    }, [filter]);

    const loadLeaveRequests = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const { data } = await hrAPI.getLeaveRequests(params);
            setLeaveRequests(data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this leave request?')) return;
        
        try {
            await hrAPI.approveLeave(id);
            showSuccess('Leave request approved!');
            loadLeaveRequests();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to approve leave request');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            showError('Please provide a rejection reason');
            return;
        }

        try {
            await hrAPI.rejectLeave(rejectModal.id, rejectionReason);
            showSuccess('Leave request rejected');
            setRejectModal(null);
            setRejectionReason('');
            loadLeaveRequests();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to reject leave request');
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
            sick: 'Sick',
            vacation: 'Vacation',
            personal: 'Personal',
            emergency: 'Emergency',
            other: 'Other'
        };
        return labels[type] || type;
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Link to="/hr/dashboard" className="btn btn-secondary mr-3">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                    <h2 className="mb-0"><i className="fas fa-calendar-check"></i> Leave Requests</h2>
                </div>
                <div>
                    <select
                        className="form-control"
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
                        <p className="text-muted text-center">No leave requests found</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Leave Type</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Days</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaveRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td>
                                                {request.employee?.firstname} {request.employee?.lastname}
                                            </td>
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
                                            <td>
                                                {request.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-success mr-2"
                                                            onClick={() => handleApprove(request.id)}
                                                        >
                                                            <i className="fas fa-check"></i> Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => setRejectModal(request)}
                                                        >
                                                            <i className="fas fa-times"></i> Reject
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {rejectModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Reject Leave Request</h5>
                                <button type="button" className="close" onClick={() => {
                                    setRejectModal(null);
                                    setRejectionReason('');
                                }}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Rejection Reason *</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Please provide a reason for rejection"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setRejectModal(null);
                                        setRejectionReason('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleReject}
                                >
                                    Reject Leave
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HRLeaveRequests;

