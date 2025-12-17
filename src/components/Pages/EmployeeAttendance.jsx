import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeeServiceAPI } from '../../services/api';
import { showError, formatDate } from '../../utils/helpers';

function EmployeeAttendance() {
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        loadAttendance();
    }, []);

    const loadAttendance = async () => {
        try {
            setLoading(true);
            const params = {};
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            
            const { data } = await employeeServiceAPI.getAttendance(params);
            setAttendances(data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        loadAttendance();
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
                    <Link to="/employee/dashboard" className="btn btn-secondary mr-3">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                    <h2 className="mb-0"><i className="fas fa-history"></i> Attendance History</h2>
                </div>
            </div>

            {/* Filter */}
            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={handleFilter} className="row">
                        <div className="col-md-4">
                            <label>Date From</label>
                            <input
                                type="date"
                                className="form-control"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label>Date To</label>
                            <input
                                type="date"
                                className="form-control"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                            <button type="submit" className="btn btn-primary mr-2">
                                <i className="fas fa-filter"></i> Filter
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setDateFrom('');
                                    setDateTo('');
                                    loadAttendance();
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Attendance Records</h5>
                </div>
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
                                            <td>{formatDate(attendance.date)}</td>
                                            <td>{attendance.time_in || '--:--'}</td>
                                            <td>{attendance.time_out || '--:--'}</td>
                                            <td>
                                                <span className={`badge badge-${getStatusBadge(attendance.status)}`}>
                                                    {attendance.status}
                                                </span>
                                            </td>
                                            <td>{attendance.notes || '-'}</td>
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

export default EmployeeAttendance;

