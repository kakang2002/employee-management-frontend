import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeeAPI } from '../../services/api';
import { isAuthenticated } from '../../utils/helpers';
import { showError } from '../../utils/helpers';

function Home() {
    const [employees, setEmployees] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Only load employees if user is authenticated
        if (isAuthenticated()) {
            loadEmployees();
        } else {
            // Clear employees when logged out
            setEmployees([]);
            setAllEmployees([]);
            setLoading(false);
        }
    }, []);

    // Listen for auth state changes (when user logs in/out)
    useEffect(() => {
        const checkAuth = () => {
            if (!isAuthenticated()) {
                // Clear employees when logged out
                setEmployees([]);
                setAllEmployees([]);
            } else if (allEmployees.length === 0) {
                // Load employees if authenticated and not loaded yet
                loadEmployees();
            }
        };

        // Check immediately
        checkAuth();

        // Check periodically for auth state changes
        const interval = setInterval(checkAuth, 1000);

        return () => clearInterval(interval);
    }, [allEmployees.length]);

    useEffect(() => {
        filterEmployees();
    }, [searchTerm, allEmployees]);

    const loadEmployees = async () => {
        setLoading(true);
        try {
            const { data } = await employeeAPI.getAll();
            setAllEmployees(data);
            setEmployees(data);
        } catch (error) {
            showError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterEmployees = () => {
        let filtered = [...allEmployees];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(employee =>
                employee.number.toLowerCase().includes(term) ||
                employee.firstname.toLowerCase().includes(term) ||
                employee.lastname.toLowerCase().includes(term) ||
                (employee.description && employee.description.toLowerCase().includes(term))
            );
        }

        setEmployees(filtered);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const viewEmployeeDetails = async (employeeId) => {
        try {
            const { data: employee } = await employeeAPI.get(employeeId);
            showEmployeeModal(employee);
        } catch (error) {
            showError('Failed to load employee details');
        }
    };

    const showEmployeeModal = (employee) => {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Employee Details</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <img src="${employee.image ? '/uploads/' + employee.image : 'https://via.placeholder.com/400x300?text=No+Image'}" 
                                     class="img-fluid rounded" alt="${employee.firstname} ${employee.lastname}">
                            </div>
                            <div class="col-md-6">
                                <h4>${employee.firstname} ${employee.lastname}</h4>
                                <div class="mb-3">
                                    <span class="badge badge-primary">Employee #${employee.number}</span>
                                </div>
                                <div class="employee-details-info">
                                    <h6>Employee Number</h6>
                                    <p>${employee.number}</p>
                                    
                                    <h6>First Name</h6>
                                    <p>${employee.firstname}</p>
                                    
                                    <h6>Last Name</h6>
                                    <p>${employee.lastname}</p>
                                    
                                    <h6>Description</h6>
                                    <p>${employee.description || 'No description available'}</p>
                                    
                                    <h6>Created by</h6>
                                    <p>${employee.creator_name}</p>
                                    
                                    <h6>Added on</h6>
                                    <p>${new Date(employee.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        window.jQuery ? window.jQuery(modal).modal('show') : modal.classList.add('show');
        
        const closeHandler = () => {
            if (window.jQuery) {
                window.jQuery(modal).off('hidden.bs.modal', closeHandler);
            }
            document.body.removeChild(modal);
        };

        if (window.jQuery) {
            window.jQuery(modal).on('hidden.bs.modal', closeHandler);
        } else {
            modal.querySelector('[data-dismiss="modal"]')?.addEventListener('click', closeHandler);
        }
    };

    return (
        <div className="container mt-4">
            {/* Hero Section */}
            <div className="jumbotron bg-primary text-white text-center">
                <h1 className="display-4"><i className="fas fa-users"></i> Welcome to Employee Management</h1>
                <p className="lead">Manage your employees with ease</p>
                {isAuthenticated() ? (
                    <Link className="btn btn-light btn-lg" to="/profile">
                        Manage My Employees
                    </Link>
                ) : (
                    <>
                        <Link className="btn btn-light btn-lg mr-3" to="/register">Get Started</Link>
                        <Link className="btn btn-outline-light btn-lg" to="/login">Sign In</Link>
                    </>
                )}
            </div>

            {/* Search Section - Only show if authenticated */}
            {isAuthenticated() && (
                <div className="row mb-4">
                    <div className="col-md-12">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search employees by number, first name, or last name..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            <div className="input-group-append">
                                <button className="btn btn-outline-secondary" type="button">
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Employees Grid */}
            {!isAuthenticated() ? (
                <div className="col-12">
                    <div className="text-center py-5">
                        <i className="fas fa-users fa-3x text-muted mb-3"></i>
                        <h4>Please sign in to view employees</h4>
                        <p className="text-muted">Sign in or register to start managing employees!</p>
                        <Link to="/login" className="btn btn-primary mr-2">Sign In</Link>
                        <Link to="/register" className="btn btn-outline-primary">Register</Link>
                    </div>
                </div>
            ) : loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            ) : employees.length === 0 ? (
                <div className="col-12">
                    <div className="text-center py-5">
                        <i className="fas fa-users fa-3x text-muted mb-3"></i>
                        <h4>No employees available</h4>
                        <p className="text-muted">Be the first to add an employee!</p>
                        <Link to="/profile" className="btn btn-primary">Add Employee</Link>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {employees.map(employee => (
                        <div key={employee.id} className="col-lg-4 col-md-6 mb-4">
                            <div className="card">
                                <img
                                    src={employee.image ? `/uploads/${employee.image}` : 'https://via.placeholder.com/300x200?text=No+Image'}
                                    className="card-img-top"
                                    alt={`${employee.firstname} ${employee.lastname}`}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{employee.firstname} {employee.lastname}</h5>
                                    <div className="mb-2">
                                        <span className="badge badge-primary">#{employee.number}</span>
                                    </div>
                                    <p className="card-text">{employee.description || 'No description available'}</p>
                                    <p className="text-muted"><small>Created by: {employee.creator_name}</small></p>
                                    <button
                                        className="btn btn-primary btn-block"
                                        onClick={() => viewEmployeeDetails(employee.id)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Home;
