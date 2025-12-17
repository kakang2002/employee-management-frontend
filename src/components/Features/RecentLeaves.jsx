import React from 'react';
import { formatDate } from '../../utils/helpers';

function RecentLeaves({ leaves }) {
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
        <div className="card">
            <div className="card-header bg-warning text-white">
                <h5 className="mb-0"><i className="fas fa-calendar-times"></i> Recent Leave Requests</h5>
            </div>
            <div className="card-body">
                {leaves.length === 0 ? (
                    <p className="text-muted text-center">No leave requests yet</p>
                ) : (
                    <div className="list-group">
                        {leaves.map((leave) => (
                            <div key={leave.id} className="list-group-item">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 className="mb-1">
                                            {getLeaveTypeLabel(leave.leave_type)} Leave
                                        </h6>
                                        <p className="mb-1 text-muted">
                                            {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                                        </p>
                                        <small className="text-muted">
                                            {leave.days_requested} day(s)
                                        </small>
                                    </div>
                                    <span className={`badge badge-${getStatusBadge(leave.status)}`}>
                                        {leave.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecentLeaves;








