import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { showSuccess, showError, formatDate } from '../../utils/helpers';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        middle_initial: '',
        role: 'employee',
        status: 'active',
        employee_number: ''
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const { data } = await adminAPI.getUsers();
            setUsers(data);
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            middle_initial: '',
            role: 'employee',
            status: 'active',
            employee_number: ''
        });
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            middle_initial: user.middle_initial || '',
            role: user.role,
            status: user.status
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await adminAPI.updateUser(editingUser.id, formData);
                showSuccess('User updated successfully!');
            } else {
                await adminAPI.createUser(formData);
                showSuccess('HR User created successfully! This user can now manage employees.');
            }
            setShowModal(false);
            loadUsers();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to save user');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) return;
        
        try {
            await adminAPI.deleteUser(id);
            showSuccess('User deactivated successfully!');
            loadUsers();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to deactivate user');
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: 'danger',
            hr_manager: 'warning',
            employee: 'info'
        };
        return badges[role] || 'secondary';
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Link to="/admin/dashboard" className="btn btn-secondary mr-3">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                    <h2 className="mb-0"><i className="fas fa-users-cog"></i> User Management</h2>
                </div>
                <button className="btn btn-primary" onClick={handleCreate}>
                    <i className="fas fa-plus"></i> Create User
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
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                {user.first_name} {user.middle_initial} {user.last_name}
                                            </td>
                                            <td>
                                                <span className={`badge badge-${getRoleBadge(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${user.status === 'active' ? 'success' : 'secondary'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td>{formatDate(user.created_at)}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary mr-2"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(user.id)}
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

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingUser ? 'Edit User' : 'Create User'}
                                </h5>
                                <button type="button" className="close" onClick={() => setShowModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Username *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Email *</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>First Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.first_name}
                                                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Last Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.last_name}
                                                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Middle Initial</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    maxLength="5"
                                                    value={formData.middle_initial}
                                                    onChange={(e) => setFormData({...formData, middle_initial: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Password {!editingUser && '*'}</label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                    required={!editingUser}
                                                    minLength="6"
                                                />
                                                {editingUser && (
                                                    <small className="form-text text-muted">Leave blank to keep current password</small>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Role *</label>
                                                <select
                                                    className="form-control"
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                    required
                                                >
                                                    <option value="hr_manager">HR Manager</option>
                                                    <option value="employee">Employee</option>
                                                </select>
                                                <small className="form-text text-muted">
                                                    Note: When creating an Employee user, an employee record will be automatically created and added to Employee Management.
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    {formData.role === 'employee' && (
                                        <div className="form-group">
                                            <label>Employee Number *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.employee_number}
                                                onChange={(e) => setFormData({...formData, employee_number: e.target.value})}
                                                required
                                                placeholder="e.g., EMP001"
                                            />
                                            <small className="form-text text-muted">
                                                This will be used as the employee number/ID.
                                            </small>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Status *</label>
                                        <select
                                            className="form-control"
                                            value={formData.status}
                                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                                            required
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingUser ? 'Update' : 'Create'} User
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

export default AdminUsers;

