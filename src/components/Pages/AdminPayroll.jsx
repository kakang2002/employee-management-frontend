import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { showError, showSuccess, formatDate, formatCurrency } from '../../utils/helpers';

function AdminPayroll() {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPayroll, setEditingPayroll] = useState(null);
    const [editForm, setEditForm] = useState({
        status: 'draft',
        payment_date: '',
    });

    useEffect(() => {
        loadPayrolls();
    }, []);

    const loadPayrolls = async () => {
        try {
            setLoading(true);
            const { data } = await adminAPI.getPayroll();
            setPayrolls(data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load payroll');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (payroll) => {
        setEditingPayroll(payroll);
        setEditForm({
            status: payroll.status || 'draft',
            payment_date: payroll.payment_date || '',
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingPayroll) return;
        try {
            await adminAPI.updatePayroll(editingPayroll.id, editForm);
            showSuccess('Payroll updated successfully');
            setEditingPayroll(null);
            loadPayrolls();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to update payroll');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payroll record?')) {
            return;
        }
        try {
            await adminAPI.deletePayroll(id);
            showSuccess('Payroll deleted successfully');
            loadPayrolls();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to delete payroll');
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
                    <Link to="/admin/dashboard" className="btn btn-secondary mr-3">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                    <h2 className="mb-0"><i className="fas fa-money-bill-wave"></i> Payroll Records</h2>
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
                    ) : payrolls.length === 0 ? (
                        <p className="text-muted text-center">No payroll records found</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Pay Period</th>
                                        <th>Base Salary</th>
                                        <th>Overtime</th>
                                        <th>Allowances</th>
                                        <th>Deductions</th>
                                        <th>Gross Salary</th>
                                        <th>Net Salary</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls.map((payroll) => (
                                        <tr key={payroll.id}>
                                            <td>
                                                {payroll.employee?.firstname} {payroll.employee?.lastname}
                                            </td>
                                            <td>
                                                {formatDate(payroll.pay_period_start)} - {formatDate(payroll.pay_period_end)}
                                            </td>
                                            <td>{formatCurrency(payroll.base_salary)}</td>
                                            <td>{payroll.overtime_hours || 0} hrs ({formatCurrency(payroll.overtime_pay || 0)})</td>
                                            <td>{formatCurrency(payroll.allowances || 0)}</td>
                                            <td>{formatCurrency(payroll.deductions || 0)}</td>
                                            <td>{formatCurrency(payroll.gross_salary)}</td>
                                            <td className="text-success font-weight-bold">
                                                {formatCurrency(payroll.net_salary)}
                                            </td>
                                            <td>
                                                <span className={`badge badge-${getStatusBadge(payroll.status)}`}>
                                                    {payroll.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary mr-2"
                                                    onClick={() => handleEditClick(payroll)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(payroll.id)}
                                                >
                                                    <i className="fas fa-trash"></i>
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
            {editingPayroll && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Payroll Status</h5>
                                <button type="button" className="close" onClick={() => setEditingPayroll(null)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            className="form-control"
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="processed">Processed</option>
                                            <option value="paid">Paid</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Payment Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={editForm.payment_date || ''}
                                            onChange={(e) => setEditForm({ ...editForm, payment_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setEditingPayroll(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Save Changes
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

export default AdminPayroll;

