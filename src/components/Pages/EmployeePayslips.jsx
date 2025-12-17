import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeeServiceAPI } from '../../services/api';
import { showError, formatDate, formatCurrency } from '../../utils/helpers';

function EmployeePayslips() {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayslips();
    }, []);

    const loadPayslips = async () => {
        try {
            setLoading(true);
            const { data } = await employeeServiceAPI.getPayslips();
            setPayslips(data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load payslips');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: 'secondary',
            processed: 'info',
            paid: 'success'
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
                    <h2 className="mb-0"><i className="fas fa-file-invoice-dollar"></i> My Payslips</h2>
                </div>
            </div>

            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            ) : payslips.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center">
                        <i className="fas fa-file-invoice fa-3x text-muted mb-3"></i>
                        <h5>No payslips available</h5>
                        <p className="text-muted">Your payslips will appear here once they are generated.</p>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {payslips.map((payslip) => (
                        <div key={payslip.id} className="col-md-6 mb-4">
                            <div className="card">
                                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        {formatDate(payslip.pay_period_start)} - {formatDate(payslip.pay_period_end)}
                                    </h5>
                                    <span className={`badge badge-${getStatusBadge(payslip.status)}`}>
                                        {payslip.status}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <div className="row mb-3">
                                        <div className="col-6">
                                            <small className="text-muted">Base Salary</small>
                                            <h6>{formatCurrency(payslip.base_salary)}</h6>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted">Net Salary</small>
                                            <h6 className="text-success">{formatCurrency(payslip.net_salary)}</h6>
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="row mb-2">
                                        <div className="col-6">
                                            <small>Overtime Hours:</small>
                                        </div>
                                        <div className="col-6 text-right">
                                            <small>{payslip.overtime_hours || 0} hrs</small>
                                        </div>
                                    </div>
                                    <div className="row mb-2">
                                        <div className="col-6">
                                            <small>Overtime Pay:</small>
                                        </div>
                                        <div className="col-6 text-right">
                                            <small>{formatCurrency(payslip.overtime_pay || 0)}</small>
                                        </div>
                                    </div>
                                    <div className="row mb-2">
                                        <div className="col-6">
                                            <small>Allowances:</small>
                                        </div>
                                        <div className="col-6 text-right">
                                            <small className="text-success">+{formatCurrency(payslip.allowances || 0)}</small>
                                        </div>
                                    </div>
                                    <div className="row mb-2">
                                        <div className="col-6">
                                            <small>Deductions:</small>
                                        </div>
                                        <div className="col-6 text-right">
                                            <small className="text-danger">-{formatCurrency(payslip.deductions || 0)}</small>
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="row">
                                        <div className="col-6">
                                            <strong>Gross Salary:</strong>
                                        </div>
                                        <div className="col-6 text-right">
                                            <strong>{formatCurrency(payslip.gross_salary)}</strong>
                                        </div>
                                    </div>
                                    {payslip.payment_date && (
                                        <div className="mt-2">
                                            <small className="text-muted">
                                                Payment Date: {formatDate(payslip.payment_date)}
                                            </small>
                                        </div>
                                    )}
                                    <div className="mt-3">
                                        <button
                                            className="btn btn-outline-primary btn-sm btn-block"
                                            onClick={() => window.print()}
                                        >
                                            <i className="fas fa-print"></i> Print Payslip
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default EmployeePayslips;

