import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hrAPI } from '../../services/api';
import { showSuccess, showError, formatDate, formatCurrency } from '../../utils/helpers';

function HRPayroll() {
    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [editingPayroll, setEditingPayroll] = useState(null);
    const [formData, setFormData] = useState({
        employee_id: '',
        pay_period_start: '',
        pay_period_end: '',
        overtime_hours: 0,
        allowances: 0,
        deductions: 0
    });

    useEffect(() => {
        loadPayrolls();
        loadEmployees();
    }, []);

    const loadPayrolls = async () => {
        try {
            setLoading(true);
            const { data } = await hrAPI.getPayroll();
            setPayrolls(data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load payroll');
        } finally {
            setLoading(false);
        }
    };

    const loadEmployees = async () => {
        try {
            const { data } = await hrAPI.getEmployees();
            setEmployees(data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load employees');
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        try {
            if (editingPayroll) {
                await hrAPI.updatePayroll(editingPayroll.id, formData);
                showSuccess('Payroll updated successfully!');
            } else {
                await hrAPI.generatePayroll(formData);
                showSuccess('Payroll generated successfully!');
            }
            setShowGenerateModal(false);
            setFormData({
                employee_id: '',
                pay_period_start: '',
                pay_period_end: '',
                overtime_hours: 0,
                allowances: 0,
                deductions: 0
            });
            setEditingPayroll(null);
            loadPayrolls();
        } catch (error) {
            showError(error.response?.data?.error || (editingPayroll ? 'Failed to update payroll' : 'Failed to generate payroll'));
        }
    };

    const handleEditClick = (payroll) => {
        setEditingPayroll(payroll);
        setFormData({
            employee_id: payroll.employee_id,
            pay_period_start: payroll.pay_period_start,
            pay_period_end: payroll.pay_period_end,
            overtime_hours: payroll.overtime_hours || 0,
            allowances: payroll.allowances || 0,
            deductions: payroll.deductions || 0
        });
        setShowGenerateModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payroll record?')) {
            return;
        }
        try {
            await hrAPI.deletePayroll(id);
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
                    <Link to="/hr/dashboard" className="btn btn-secondary mr-3">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                    <h2 className="mb-0"><i className="fas fa-money-bill-wave"></i> Payroll Management</h2>
                </div>
                <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)}>
                    <i className="fas fa-plus"></i> Generate Payroll
                </button>
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
                                        <th>Gross Salary</th>
                                        <th>Net Salary</th>
                                        <th>Status</th>
                                        <th>Generated By</th>
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
                                                {payroll.generated_by_user?.username || 'System'}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary mr-2"
                                                    type="button"
                                                    onClick={() => handleEditClick(payroll)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    type="button"
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

            {/* Generate Modal */}
            {showGenerateModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingPayroll ? 'Edit Payroll' : 'Generate Payroll'}</h5>
                                <button type="button" className="close" onClick={() => setShowGenerateModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleGenerate}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Employee *</label>
                                        <select
                                            className="form-control"
                                            value={formData.employee_id}
                                            onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                                            required
                                        >
                                            <option value="">Select Employee</option>
                                            {employees.map((emp) => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.firstname} {emp.lastname} - {emp.employee_number || emp.number}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Pay Period Start *</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={formData.pay_period_start}
                                                    onChange={(e) => setFormData({...formData, pay_period_start: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Pay Period End *</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={formData.pay_period_end}
                                                    onChange={(e) => setFormData({...formData, pay_period_end: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Overtime Hours</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    step="0.5"
                                                    min="0"
                                                    value={formData.overtime_hours}
                                                    onChange={(e) => setFormData({...formData, overtime_hours: parseFloat(e.target.value) || 0})}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Allowances</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.allowances}
                                                    onChange={(e) => setFormData({...formData, allowances: parseFloat(e.target.value) || 0})}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Deductions</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.deductions}
                                                    onChange={(e) => setFormData({...formData, deductions: parseFloat(e.target.value) || 0})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowGenerateModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Generate Payroll
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

export default HRPayroll;

