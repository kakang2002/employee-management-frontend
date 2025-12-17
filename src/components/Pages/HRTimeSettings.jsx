import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hrAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/helpers';

function HRTimeSettings() {
    const [settings, setSettings] = useState({
        default_time_in: '08:00',
        default_time_out: '16:00'
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setFetching(true);
            const { data } = await hrAPI.getTimeSettings();
            // Convert HH:mm:ss to HH:mm for time input
            setSettings({
                default_time_in: data.default_time_in ? data.default_time_in.substring(0, 5) : '08:00',
                default_time_out: data.default_time_out ? data.default_time_out.substring(0, 5) : '16:00'
            });
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load time settings');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setSettings({
            ...settings,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await hrAPI.updateTimeSettings(settings);
            showSuccess('Time settings updated successfully!');
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to update time settings');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="container-fluid mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Link to="/hr/dashboard" className="btn btn-secondary mr-3">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                    <h2 className="mb-0"><i className="fas fa-clock"></i> Time Settings</h2>
                </div>
            </div>

            <div className="row">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0"><i className="fas fa-cog"></i> Default Time Settings</h5>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-info">
                                <h6><i className="fas fa-info-circle"></i> How Default Times Work:</h6>
                                <ul className="mb-0">
                                    <li><strong>Default Time In:</strong> This is the standard time employees should clock in.</li>
                                    <li style={{marginLeft: '20px'}}>→ Employees who clock in <strong>BEFORE</strong> this time = <strong>On Time</strong> (status: Present)</li>
                                    <li style={{marginLeft: '20px'}}>→ Employees who clock in <strong>AFTER</strong> this time = <strong>Late</strong> (status: Late)</li>
                                    <li><strong>Default Time Out:</strong> This is the standard time employees should clock out.</li>
                                    <li style={{marginLeft: '20px'}}>→ Employees who clock out <strong>AFTER</strong> this time = <strong>On Time</strong></li>
                                    <li style={{marginLeft: '20px'}}>→ Employees who clock out <strong>BEFORE</strong> this time = <strong>Early</strong></li>
                                    <li><strong>Important:</strong> These defaults are used when employees clock in/out automatically, and when HR edits attendance records.</li>
                                </ul>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Default Time In *</label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        name="default_time_in"
                                        value={settings.default_time_in}
                                        onChange={handleChange}
                                        required
                                    />
                                    <small className="form-text text-muted">
                                        Default time employees should clock in. Time in before this = on time, after = late.
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label>Default Time Out *</label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        name="default_time_out"
                                        value={settings.default_time_out}
                                        onChange={handleChange}
                                        required
                                    />
                                    <small className="form-text text-muted">
                                        Default time employees should clock out. Time out after this = on time, before = early.
                                    </small>
                                </div>

                                <div className="d-flex justify-content-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Updating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save"></i> Update Settings
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

export default HRTimeSettings;

