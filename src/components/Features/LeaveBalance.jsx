import React from 'react';
import { formatDate } from '../../utils/helpers';

function LeaveBalance({ balances }) {
    const getLeaveTypeLabel = (type) => {
        const labels = {
            sick: 'Sick Leave',
            vacation: 'Vacation Leave',
            personal: 'Personal Leave'
        };
        return labels[type] || type;
    };

    const getLeaveTypeIcon = (type) => {
        const icons = {
            sick: 'fa-thermometer-half',
            vacation: 'fa-umbrella-beach',
            personal: 'fa-user-clock'
        };
        return icons[type] || 'fa-calendar';
    };

    return (
        <div className="card">
            <div className="card-header bg-info text-white">
                <h5 className="mb-0"><i className="fas fa-calendar-check"></i> Leave Balance</h5>
            </div>
            <div className="card-body">
                {balances.length === 0 ? (
                    <p className="text-muted text-center">No leave balance available</p>
                ) : (
                    <div className="row">
                        {balances.map((balance) => (
                            <div key={balance.id} className="col-md-12 mb-3">
                                <div className="card border">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6>
                                                    <i className={`fas ${getLeaveTypeIcon(balance.leave_type)} text-primary`}></i>
                                                    {' '}{getLeaveTypeLabel(balance.leave_type)}
                                                </h6>
                                                {balance.year && (
                                                    <small className="text-muted">Year: {balance.year}</small>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="mb-1">
                                                    <span className="badge badge-primary">
                                                        Total: {balance.total_days} days
                                                    </span>
                                                </div>
                                                <div className="mb-1">
                                                    <span className="badge badge-warning">
                                                        Used: {balance.used_days} days
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className={`badge badge-${balance.remaining_days > 0 ? 'success' : 'danger'}`}>
                                                        Remaining: {balance.remaining_days} days
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeaveBalance;

