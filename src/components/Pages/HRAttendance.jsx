import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hrAPI } from '../../services/api';
import { showSuccess, showError, formatDate } from '../../utils/helpers';

function HRAttendance() {
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [editingAttendance, setEditingAttendance] = useState(null);
    const [timeSettings, setTimeSettings] = useState({
        default_time_in: '08:00:00',
        default_time_out: '16:00:00'
    });
    const [formData, setFormData] = useState({
        time_in: '',
        time_out: '',
        status: 'present',
        notes: ''
    });

    useEffect(() => {
        loadTimeSettings();
        loadAttendance();
    }, [date]);

    const loadTimeSettings = async () => {
        try {
            const { data } = await hrAPI.getTimeSettings();
            setTimeSettings(data);
        } catch (error) {
            console.error('Failed to load time settings:', error);
        }
    };

    const loadAttendance = async () => {
        try {
            setLoading(true);
            const params = date ? { date } : {};
            const { data } = await hrAPI.getAttendance(params);
            setAttendances(data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (attendance) => {
        setEditingAttendance(attendance);
        setFormData({
            time_in: attendance.time_in || '',
            time_out: attendance.time_out || '',
            status: attendance.status,
            notes: attendance.notes || ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await hrAPI.updateAttendance(editingAttendance.id, formData);
            showSuccess('Attendance updated successfully!');
            setEditingAttendance(null);
            loadAttendance();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to update attendance');
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

    const isLate = (timeIn) => {
        if (!timeIn) return false;
        const defaultTime = timeSettings.default_time_in.substring(0, 5); // HH:mm
        return timeIn > defaultTime;
    };

    const isEarly = (timeOut) => {
        if (!timeOut) return false;
        const defaultTime = timeSettings.default_time_out.substring(0, 5); // HH:mm
        return timeOut < defaultTime;
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Link to="/hr/dashboard" className="btn btn-secondary mr-3">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                    <h2 className="mb-0"><i className="fas fa-clock"></i> Attendance Management</h2>
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
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.map((attendance) => (
                                        <tr key={attendance.id}>
                                            <td>
                                                {attendance.employee?.firstname} {attendance.employee?.lastname}
                                            </td>
                                            <td>{formatDate(attendance.date)}</td>
                                            <td>
                                                {attendance.time_in ? (
                                                    <span>
                                                        {attendance.time_in}
                                                        {isLate(attendance.time_in) && (
                                                            <span className="badge badge-warning ml-2">Late</span>
                                                        )}
                                                    </span>
                                                ) : (
                                                    '--:--'
                                                )}
                                                <br />
                                                <small className="text-muted">
                                                    Default: {timeSettings.default_time_in.substring(0, 5)}
                                                </small>
                                            </td>
                                            <td>
                                                {attendance.time_out ? (
                                                    <span>
                                                        {attendance.time_out}
                                                        {isEarly(attendance.time_out) && (
                                                            <span className="badge badge-warning ml-2">Early</span>
                                                        )}
                                                    </span>
                                                ) : (
                                                    '--:--'
                                                )}
                                                <br />
                                                <small className="text-muted">
                                                    Default: {timeSettings.default_time_out.substring(0, 5)}
                                                </small>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${getStatusBadge(attendance.status)}`}>
                                                    {attendance.status}
                                                </span>
                                            </td>
                                            <td>
                                                <small>{attendance.notes || '-'}</small>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleEdit(attendance)}
                                                >
                                                    <i className="fas fa-edit"></i> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingAttendance && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Attendance</h5>
                                <button type="button" className="close" onClick={() => setEditingAttendance(null)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleUpdate}>
                                <div className="modal-body">
                                    <div className="alert alert-info">
                                        <small>
                                            <strong>Default Times:</strong> Time In: {timeSettings.default_time_in.substring(0, 5)}, 
                                            Time Out: {timeSettings.default_time_out.substring(0, 5)}
                                            <br />
                                            Times before default Time In = On Time, after = Late
                                            <br />
                                            Times after default Time Out = On Time, before = Early
                                        </small>
                                    </div>
                                    <div className="form-group">
                                        <label>Time In</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={formData.time_in}
                                            onChange={(e) => {
                                                const newTimeIn = e.target.value;
                                                setFormData({...formData, time_in: newTimeIn});
                                                // Auto-update status based on default time
                                                if (newTimeIn) {
                                                    const defaultTime = timeSettings.default_time_in.substring(0, 5);
                                                    if (newTimeIn > defaultTime) {
                                                        setFormData(prev => ({...prev, time_in: newTimeIn, status: 'late'}));
                                                    } else {
                                                        setFormData(prev => ({...prev, time_in: newTimeIn, status: 'present'}));
                                                    }
                                                }
                                            }}
                                        />
                                        <small className="form-text text-muted">
                                            Default: {timeSettings.default_time_in.substring(0, 5)} (before = on time, after = late)
                                        </small>
                                    </div>
                                    <div className="form-group">
                                        <label>Time Out</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={formData.time_out}
                                            onChange={(e) => setFormData({...formData, time_out: e.target.value})}
                                        />
                                        <small className="form-text text-muted">
                                            Default: {timeSettings.default_time_out.substring(0, 5)} (after = on time, before = early)
                                        </small>
                                    </div>
                                    <div className="form-group">
                                        <label>Status *</label>
                                        <select
                                            className="form-control"
                                            value={formData.status}
                                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                                            required
                                        >
                                            <option value="present">Present</option>
                                            <option value="late">Late</option>
                                            <option value="absent">Absent</option>
                                            <option value="half_day">Half Day</option>
                                            <option value="on_leave">On Leave</option>
                                        </select>
                                        <small className="form-text text-muted">
                                            Status will be auto-set based on Time In vs Default Time In
                                        </small>
                                    </div>
                                    <div className="form-group">
                                        <label>Notes</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditingAttendance(null)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Update Attendance
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HRAttendance;

