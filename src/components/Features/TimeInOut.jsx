import React, { useState } from 'react';
import { employeeServiceAPI } from '../../services/api';
import { showSuccess, showError, formatDate } from '../../utils/helpers';

function TimeInOut({ attendance, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const hasTimedIn = attendance?.time_in;
    const hasTimedOut = attendance?.time_out;
    const status = attendance?.status || 'absent';

    const formatTime = (timeValue) => {
        if (!timeValue) return '--:--';
        // Handle both string and datetime formats
        if (typeof timeValue === 'string') {
            // If it's already in HH:mm format
            if (timeValue.match(/^\d{2}:\d{2}/)) {
                return timeValue.substring(0, 5);
            }
            // If it's a datetime string
            const date = new Date(timeValue);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        return '--:--';
    };

    const handleTimeIn = async () => {
        try {
            setLoading(true);
            await employeeServiceAPI.timeIn();
            showSuccess('Time in recorded successfully!');
            if (onUpdate) onUpdate();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to record time in');
        } finally {
            setLoading(false);
        }
    };

    const handleTimeOut = async () => {
        try {
            setLoading(true);
            await employeeServiceAPI.timeOut();
            showSuccess('Time out recorded successfully!');
            if (onUpdate) onUpdate();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to record time out');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = () => {
        const statusColors = {
            present: 'success',
            late: 'warning',
            absent: 'danger',
            on_leave: 'info',
            half_day: 'secondary'
        };
        return statusColors[status] || 'secondary';
    };

    return (
        <div className="card">
            <div className="card-header bg-primary text-white">
                <h5 className="mb-0"><i className="fas fa-clock"></i> Today's Attendance</h5>
            </div>
            <div className="card-body text-center">
                <div className="mb-3">
                    <span className={`badge badge-${getStatusBadge()} badge-lg p-3`}>
                        Status: {status.toUpperCase()}
                    </span>
                </div>
                
                <div className="row mb-3">
                    <div className="col-md-6">
                        <div className="card bg-light">
                            <div className="card-body">
                                <h6>Time In</h6>
                                {hasTimedIn ? (
                                    <h4 className="text-success">{formatTime(attendance.time_in)}</h4>
                                ) : (
                                    <h4 className="text-muted">--:--</h4>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card bg-light">
                            <div className="card-body">
                                <h6>Time Out</h6>
                                {hasTimedOut ? (
                                    <h4 className="text-success">{formatTime(attendance.time_out)}</h4>
                                ) : (
                                    <h4 className="text-muted">--:--</h4>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-center gap-2">
                    {!hasTimedIn && (
                        <button
                            className="btn btn-success btn-lg"
                            onClick={handleTimeIn}
                            disabled={loading}
                        >
                            <i className="fas fa-sign-in-alt"></i> Time In
                        </button>
                    )}
                    {hasTimedIn && !hasTimedOut && (
                        <button
                            className="btn btn-danger btn-lg"
                            onClick={handleTimeOut}
                            disabled={loading}
                        >
                            <i className="fas fa-sign-out-alt"></i> Time Out
                        </button>
                    )}
                    {hasTimedIn && hasTimedOut && (
                        <div className="alert alert-info mb-0">
                            <i className="fas fa-check-circle"></i> Attendance completed for today
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TimeInOut;

