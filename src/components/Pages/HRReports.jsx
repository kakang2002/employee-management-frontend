import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { hrAPI } from '../../services/api';
import { showError, formatDate } from '../../utils/helpers';

function HRReports() {
    const [reportType, setReportType] = useState('attendance');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        
        if (!dateFrom || !dateTo) {
            showError('Please select date range');
            return;
        }

        try {
            setLoading(true);
            let data;
            if (reportType === 'attendance') {
                const response = await hrAPI.attendanceReport({ date_from: dateFrom, date_to: dateTo });
                data = response.data;
            } else {
                const response = await hrAPI.leaveReport({ date_from: dateFrom, date_to: dateTo });
                data = response.data;
            }
            setReportData(data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Link to="/hr/dashboard" className="btn btn-secondary mr-3">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                    <h2 className="mb-0"><i className="fas fa-chart-bar"></i> Reports</h2>
                </div>
            </div>

            {/* Report Generator */}
            <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Generate Report</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleGenerateReport}>
                        <div className="row">
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Report Type</label>
                                    <select
                                        className="form-control"
                                        value={reportType}
                                        onChange={(e) => {
                                            setReportType(e.target.value);
                                            setReportData(null);
                                        }}
                                    >
                                        <option value="attendance">Attendance Report</option>
                                        <option value="leave">Leave Report</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Date From *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Date To *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Generating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-file-pdf"></i> Generate Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Report Results */}
            {reportData && (
                <div className="card">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">
                            {reportType === 'attendance' ? 'Attendance' : 'Leave'} Report
                            <small className="ml-3">
                                {formatDate(reportData.period?.from)} - {formatDate(reportData.period?.to)}
                            </small>
                        </h5>
                    </div>
                    <div className="card-body">
                        {reportType === 'attendance' ? (
                            <div>
                                <h6>Summary</h6>
                                <div className="row mb-4">
                                    <div className="col-md-3">
                                        <div className="card bg-success text-white">
                                            <div className="card-body text-center">
                                                <h3>{reportData.summary?.present || 0}</h3>
                                                <p className="mb-0">Present</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-danger text-white">
                                            <div className="card-body text-center">
                                                <h3>{reportData.summary?.absent || 0}</h3>
                                                <p className="mb-0">Absent</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-warning text-white">
                                            <div className="card-body text-center">
                                                <h3>{reportData.summary?.late || 0}</h3>
                                                <p className="mb-0">Late</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-info text-white">
                                            <div className="card-body text-center">
                                                <h3>{reportData.summary?.on_leave || 0}</h3>
                                                <p className="mb-0">On Leave</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h6>Summary</h6>
                                <div className="row mb-4">
                                    <div className="col-md-4">
                                        <div className="card bg-warning text-white">
                                            <div className="card-body text-center">
                                                <h3>{reportData.summary?.pending || 0}</h3>
                                                <p className="mb-0">Pending</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card bg-success text-white">
                                            <div className="card-body text-center">
                                                <h3>{reportData.summary?.approved || 0}</h3>
                                                <p className="mb-0">Approved</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card bg-danger text-white">
                                            <div className="card-body text-center">
                                                <h3>{reportData.summary?.rejected || 0}</h3>
                                                <p className="mb-0">Rejected</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default HRReports;

