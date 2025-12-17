import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { employeeServiceAPI } from '../../services/api';
import { showSuccess, showError, formatDate } from '../../utils/helpers';

function EmployeeLeaveRequest() {
    const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        reason: ''
    });
    const [canRequest, setCanRequest] = useState(true);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkCanRequest();
    }, []);

    const checkCanRequest = async () => {
        try {
            setChecking(true);
            const { data } = await employeeServiceAPI.canRequestLeave();
            setCanRequest(data.can_request);
            if (!data.can_request) {
                showError(data.message);
            }
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to check leave eligibility');
        } finally {
            setChecking(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const calculateDays = () => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays;
        }
        return 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.start_date || !formData.end_date || !formData.reason) {
            showError('Please fill in all required fields');
            return;
        }

        const daysRequested = calculateDays();

        if (daysRequested > 3) {
            showError('You can only request a maximum of 3 days leave at a time.');
            return;
        }

        if (daysRequested < 1) {
            showError('Please select valid dates');
            return;
        }

        if (!canRequest) {
            showError('You have already requested leave this month. You can only request leave once per month.');
            return;
        }

        try {
            setLoading(true);
            await employeeServiceAPI.submitLeaveRequest(formData);
            showSuccess('Leave request submitted successfully!');
            setTimeout(() => {
                navigate('/employee/leave-requests');
            }, 1500);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="mb-3">
                        <Link to="/employee/dashboard" className="btn btn-secondary">
                            <i className="fas fa-arrow-left"></i> Back to Dashboard
                        </Link>
                    </div>
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0"><i className="fas fa-calendar-plus"></i> Request Leave</h4>
                        </div>
                        <div className="card-body">
                            {/* Leave Rules Info */}
                            <div className="alert alert-info">
                                <h6><i className="fas fa-info-circle"></i> Leave Request Rules:</h6>
                                <ul className="mb-0">
                                    <li>You can only request leave <strong>once per month</strong></li>
                                    <li>Maximum <strong>3 days</strong> per request</li>
                                    <li>Leave requests reset at the beginning of each month</li>
                                </ul>
                            </div>

                            {!canRequest && (
                                <div className="alert alert-warning">
                                    <i className="fas fa-exclamation-triangle"></i> You have already submitted a leave request this month. 
                                    You can submit a new request next month.
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Start Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                        disabled={!canRequest}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>End Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        min={formData.start_date || new Date().toISOString().split('T')[0]}
                                        required
                                        disabled={!canRequest}
                                    />
                                    {calculateDays() > 0 && (
                                        <small className={`form-text ${calculateDays() > 3 ? 'text-danger' : 'text-info'}`}>
                                            Days requested: {calculateDays()} {calculateDays() > 3 && '(Maximum 3 days allowed)'}
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Reason *</label>
                                    <textarea
                                        className="form-control"
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Please provide a reason for your leave request"
                                        required
                                        disabled={!canRequest}
                                    />
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/employee/dashboard')}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading || !canRequest}
                                    >
                                        {loading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane"></i> Submit Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeLeaveRequest;
