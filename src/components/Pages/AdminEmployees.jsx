import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { showSuccess, showError, formatDate, formatCurrency } from '../../utils/helpers';

function AdminEmployees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [userCredentials, setUserCredentials] = useState(null);
    const [formData, setFormData] = useState({
        number: '',
        firstname: '',
        lastname: '',
        position: '',
        department: '',
        hire_date: '',
        salary: '',
        status: 'active',
        description: '',
        image: null
    });

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const { data } = await adminAPI.getEmployees();
            setEmployees(data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load employees');
        } finally {
            setLoading(false);
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

    const handleCreate = () => {
        setEditingEmployee(null);
        setFormData({
            number: '',
            firstname: '',
            lastname: '',
            position: '',
            department: '',
            hire_date: '',
            salary: '',
            status: 'active',
            description: '',
            image: null
        });
        setShowModal(true);
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            number: employee.number || employee.employee_number || '',
            firstname: employee.firstname || '',
            lastname: employee.lastname || '',
            position: employee.position || '',
            department: employee.department || '',
            hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
            salary: employee.salary || '',
            status: employee.status || 'active',
            description: employee.description || '',
            image: null
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create FormData for file uploads
            const data = new FormData();
            for (const key in formData) {
                if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    data.append(key, formData[key]);
                }
            }

            // Only allow editing, not creating
            if (editingEmployee) {
                await adminAPI.updateEmployee(editingEmployee.id, data);
                showSuccess('Employee updated successfully!');
                setShowModal(false);
                loadEmployees();
            }
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to save employee');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        
        try {
            await adminAPI.deleteEmployee(id);
            showSuccess('Employee deleted successfully!');
            loadEmployees();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to delete employee');
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Link to="/admin/dashboard" className="btn btn-secondary mr-3">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                    <h2 className="mb-0"><i className="fas fa-users"></i> Employee Management</h2>
                </div>
                <div className="alert alert-info mb-0" style={{ padding: '8px 16px', margin: 0 }}>
                    <i className="fas fa-info-circle"></i> Employees are created automatically when you create an Employee user in User Management.
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
                                            <td>{employee.user?.username || '-'}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary mr-2"
                                                    onClick={() => handleEdit(employee)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(employee.id)}
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

            {/* Edit Modal Only */}
            {showModal && editingEmployee && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Edit Employee
                                </h5>
                                <button type="button" className="close" onClick={() => setShowModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Employee Number/ID *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.number}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData({
                                                    ...formData, 
                                                    number: value,
                                                    employee_number: value // Set both to the same value
                                                });
                                            }}
                                            required
                                        />
                                        <small className="form-text text-muted">
                                            This will be used as both Employee Number and Employee ID.
                                        </small>
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
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Employee Image</label>
                                        <input
                                            type="file"
                                            className="form-control-file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({...formData, image: e.target.files[0] || null})}
                                        />
                                        {editingEmployee && editingEmployee.image && (
                                            <small className="form-text text-muted">
                                                Current image: {editingEmployee.image}
                                            </small>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
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

            {/* User Credentials Modal */}
            {showCredentialsModal && userCredentials && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">
                                    <i className="fas fa-check-circle"></i> Employee Account Created
                                </h5>
                                <button 
                                    type="button" 
                                    className="close text-white" 
                                    onClick={() => {
                                        setShowCredentialsModal(false);
                                        setUserCredentials(null);
                                    }}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info">
                                    <i className="fas fa-info-circle"></i> A user account has been automatically created for this employee. 
                                    They can now log in using the credentials below:
                                </div>
                                <div className="card bg-light">
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <label className="font-weight-bold">Username:</label>
                                            <div className="input-group">
                                                <input 
                                                    type="text" 
                                                    className="form-control font-monospace" 
                                                    value={userCredentials.username} 
                                                    readOnly
                                                />
                                                <div className="input-group-append">
                                                    <button 
                                                        className="btn btn-outline-secondary" 
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(userCredentials.username);
                                                            showSuccess('Username copied to clipboard!');
                                                        }}
                                                    >
                                                        <i className="fas fa-copy"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="font-weight-bold">Email:</label>
                                            <div className="input-group">
                                                <input 
                                                    type="text" 
                                                    className="form-control font-monospace" 
                                                    value={userCredentials.email} 
                                                    readOnly
                                                />
                                                <div className="input-group-append">
                                                    <button 
                                                        className="btn btn-outline-secondary" 
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(userCredentials.email);
                                                            showSuccess('Email copied to clipboard!');
                                                        }}
                                                    >
                                                        <i className="fas fa-copy"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="font-weight-bold">Password:</label>
                                            <div className="input-group">
                                                <input 
                                                    type="text" 
                                                    className="form-control font-monospace" 
                                                    value={userCredentials.password} 
                                                    readOnly
                                                />
                                                <div className="input-group-append">
                                                    <button 
                                                        className="btn btn-outline-secondary" 
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(userCredentials.password);
                                                            showSuccess('Password copied to clipboard!');
                                                        }}
                                                    >
                                                        <i className="fas fa-copy"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <small className="form-text text-muted">
                                                <i className="fas fa-exclamation-triangle text-warning"></i> 
                                                This is the default password. The employee should change it after first login.
                                            </small>
                                        </div>
                                        <div className="mb-0">
                                            <label className="font-weight-bold">Role:</label>
                                            <div>
                                                <span className="badge badge-info">{userCredentials.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="alert alert-warning mt-3">
                                    <i className="fas fa-exclamation-triangle"></i> 
                                    <strong>Important:</strong> Please save these credentials securely. The employee will need them to log in.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={() => {
                                        const text = `Username: ${userCredentials.username}\nEmail: ${userCredentials.email}\nPassword: ${userCredentials.password}\nRole: ${userCredentials.role}`;
                                        navigator.clipboard.writeText(text);
                                        showSuccess('All credentials copied to clipboard!');
                                    }}
                                >
                                    <i className="fas fa-copy"></i> Copy All
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => {
                                        setShowCredentialsModal(false);
                                        setUserCredentials(null);
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminEmployees;

