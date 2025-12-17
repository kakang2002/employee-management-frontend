import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { showError, formatDate } from '../../utils/helpers';

function AdminAttendance() {
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadAttendance();
    }, [date]);

    const loadAttendance = async () => {
        try {
            setLoading(true);
            const params = date ? { date } : {};
            const { data } = await adminAPI.getAttendance(params);
            setAttendances(data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load attendance');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            present: 'success',
            late: 'warning',
            absent: 'danger',
            on_leave: 'info',
            half_day: 'secondary'
        };
        return badges[status] || 'secondary';
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Link to="/admin/dashboard" className="btn btn-secondary mr-3">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                    <h2 className="mb-0"><i className="fas fa-clock"></i> Attendance Records</h2>
                </div>
                <div>
                    <input
                        type="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
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
                    ) : attendances.length === 0 ? (
                        <p className="text-muted text-center">No attendance records found</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Date</th>
                                        <th>Time In</th>
                                        <th>Time Out</th>
                                        <th>Status</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.map((attendance) => (
                                        <tr key={attendance.id}>
                                            <td>
                                                {attendance.employee?.firstname} {attendance.employee?.lastname}
                                            </td>
                                            <td>{formatDate(attendance.date)}</td>
                                            <td>{attendance.time_in ? new Date(attendance.time_in).toLocaleTimeString() : '--:--'}</td>
                                            <td>{attendance.time_out ? new Date(attendance.time_out).toLocaleTimeString() : '--:--'}</td>
                                            <td>
                                                <span className={`badge badge-${getStatusBadge(attendance.status)}`}>
                                                    {attendance.status}
                                                </span>
                                            </td>
                                            <td>
                                                <small>{attendance.notes || '-'}</small>
                                            </td>
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

export default AdminAttendance;

