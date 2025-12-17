import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hrAPI, adminAPI } from '../../services/api';
import { showSuccess, showError, formatDate, formatCurrency } from '../../utils/helpers';

function HREmployees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        number: '',
        employee_number: '',
        firstname: '',
        lastname: '',
        position: '',
        department: '',
        hire_date: '',
        salary: '',
        status: 'active',
        description: ''
    });

    useEffect(() => {
        loadEmployees();
    }, []);


    const loadEmployees = async () => {
        try {
            setLoading(true);
            const { data } = await hrAPI.getEmployees();
            setEmployees(data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            user_id: employee.user_id || '',
            number: employee.number || '',
            employee_number: employee.employee_number || '',
            firstname: employee.firstname || '',
            lastname: employee.lastname || '',
            position: employee.position || '',
            department: employee.department || '',
            hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
            salary: employee.salary || '',
            status: employee.status || 'active',
            description: employee.description || ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await hrAPI.updateEmployee(editingEmployee.id, formData);
            showSuccess('Employee updated successfully!');
            setEditingEmployee(null);
            loadEmployees();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to update employee');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: 'success',
            inactive: 'secondary',
            terminated: 'danger'
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
                    <h2 className="mb-0"><i className="fas fa-users"></i> Employee Management</h2>
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
                    ) : employees.length === 0 ? (
                        <p className="text-muted text-center">No employees found</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Photo</th>
                                        <th>Employee #</th>
                                        <th>Name</th>
                                        <th>Position</th>
                                        <th>Department</th>
                                        <th>Hire Date</th>
                                        <th>Salary</th>
                                        <th>Status</th>
                                        <th>User</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((employee) => (
                                        <tr key={employee.id}>
                                            <td>
                                                <img
                                                    src={employee.image && employee.image !== 'null' && employee.image !== ''
                                                        ? `/uploads/${employee.image}`
                                                        : 'https://via.placeholder.com/40x40?text=No+Img'}
                                                    alt={`${employee.firstname} ${employee.lastname}`}
                                                    className="rounded-circle"
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/40x40?text=No+Img';
                                                    }}
                                                />
                                            </td>
                                            <td>{employee.employee_number || employee.number}</td>
                                            <td>{employee.firstname} {employee.lastname}</td>
                                            <td>{employee.position || '-'}</td>
                                            <td>{employee.department || '-'}</td>
                                            <td>{employee.hire_date ? formatDate(employee.hire_date) : '-'}</td>
                                            <td>{employee.salary ? formatCurrency(employee.salary) : '-'}</td>
                                            <td>
                                                <span className={`badge badge-${getStatusBadge(employee.status)}`}>
                                                    {employee.status || 'active'}
                                                </span>
                                            </td>
                                            <td>
                                                {employee.user ? (
                                                    <span className="badge badge-success">
                                                        {employee.user.username} ({employee.user.role})
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-warning">Not Assigned</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleEdit(employee)}
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
            {editingEmployee && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Employee</h5>
                                <button type="button" className="close" onClick={() => setEditingEmployee(null)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleUpdate}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Employee Number</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.employee_number}
                                                    onChange={(e) => setFormData({...formData, employee_number: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Status</label>
                                                <select
                                                    className="form-control"
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="terminated">Terminated</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>First Name *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.firstname}
                                                    onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Last Name *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.lastname}
                                                    onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Position</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.position}
                                                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Department</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.department}
                                                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Hire Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={formData.hire_date}
                                                    onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Salary</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="form-control"
                                                    value={formData.salary}
                                                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditingEmployee(null)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Update Employee
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

export default HREmployees;

