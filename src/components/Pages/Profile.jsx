import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI, employeeAPI, authAPI } from '../../services/api';
import { showSuccess, showError, formatDate, isAuthenticated, getCurrentUser, getRoleRedirectPath, setCurrentUser } from '../../utils/helpers';

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [profileForm, setProfileForm] = useState({
        first_name: '',
        last_name: '',
        middle_initial: '',
        profile_picture: null,
    });
    const [employeeForm, setEmployeeForm] = useState({
        number: '',
        firstname: '',
        lastname: '',
        description: '',
        image: null,
    });
    const [employeeError, setEmployeeError] = useState('');

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        
        const currentUser = getCurrentUser();
        
        loadUserInfo();
    }, [navigate]);

    const loadUserInfo = async () => {
        try {
            const { data } = await profileAPI.get();
            setUser(data.user);
            // Keep localStorage user in sync so navbar/dashboards show latest info
            setCurrentUser(data.user);
            setProfileForm({
                first_name: data.user.first_name || '',
                last_name: data.user.last_name || '',
                middle_initial: data.user.middle_initial || '',
                profile_picture: null,
            });
        } catch (error) {
            console.error('Error loading user info:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showError('Image size must be less than 2MB');
            e.target.value = ''; // Reset input
            return;
        }

        // Validate file type
        if (!file.type.match('image.*')) {
            showError('Please select a valid image file');
            e.target.value = ''; // Reset input
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('profilePicture');
            if (img) img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Upload the profile picture directly
        const formData = new FormData();
        formData.append('first_name', user?.first_name || '');
        formData.append('last_name', user?.last_name || '');
        formData.append('middle_initial', user?.middle_initial || '');
        formData.append('profile_picture', file);

        try {
            const response = await profileAPI.update(formData);
            showSuccess('Profile picture updated successfully!');
            // Always reload user info to get the latest data including the new image
            await loadUserInfo();
        } catch (error) {
            console.error('Profile picture upload error:', error);
            showError(error.response?.data?.error || 'Failed to upload profile picture. Please try again.');
            // Reload to show original picture
            await loadUserInfo();
        } finally {
            // Reset input to allow selecting the same file again
            e.target.value = '';
        }
    };

    const editProfile = () => {
        setProfileForm({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            middle_initial: user.middle_initial || '',
            profile_picture: null,
        });
        setShowProfileModal(true);
    };

    const changePassword = async () => {
        // Validate passwords
        if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirmation) {
            setPasswordError('All password fields are required');
            return;
        }

        if (passwordForm.new_password.length < 6) {
            setPasswordError('New password must be at least 6 characters long');
            return;
        }

        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            setPasswordError('New passwords do not match');
            return;
        }

        setPasswordError('');

        try {
            await profileAPI.changePassword({
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
                new_password_confirmation: passwordForm.new_password_confirmation,
            });
            setShowPasswordModal(false);
            showSuccess('Password changed successfully!');
            // Reset form
            setPasswordForm({
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
        } catch (error) {
            console.error('Password change error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to change password. Please try again.';
            setPasswordError(errorMessage);
            showError(errorMessage);
        }
    };

    const saveProfile = async () => {
        // Validate required fields - trim whitespace
        const first_name = (profileForm.first_name || '').trim();
        const last_name = (profileForm.last_name || '').trim();
        const middle_initial = (profileForm.middle_initial || '').trim();

        if (!first_name || !last_name) {
            showError('First name and last name are required');
            return;
        }

        const formData = new FormData();
        formData.append('first_name', first_name);
        formData.append('last_name', last_name);
        formData.append('middle_initial', middle_initial);

        if (profileForm.profile_picture && profileForm.profile_picture instanceof File) {
            // Validate file size (max 2MB)
            if (profileForm.profile_picture.size > 2 * 1024 * 1024) {
                showError('Image size must be less than 2MB');
                return;
            }
            // Validate file type
            if (!profileForm.profile_picture.type.match('image.*')) {
                showError('Please select a valid image file');
                return;
            }
            formData.append('profile_picture', profileForm.profile_picture);
            console.log('Appending profile picture:', profileForm.profile_picture.name, profileForm.profile_picture.size, profileForm.profile_picture.type);
        }

        // Debug: Log FormData contents
        console.log('Sending profile data:', {
            first_name,
            last_name,
            middle_initial,
            hasProfilePicture: !!profileForm.profile_picture,
            profilePictureType: profileForm.profile_picture ? typeof profileForm.profile_picture : 'null',
            profilePictureIsFile: profileForm.profile_picture instanceof File
        });
        
        // Debug: Log FormData entries
        if (profileForm.profile_picture) {
            for (let pair of formData.entries()) {
                console.log('FormData entry:', pair[0], pair[1]);
            }
        }

        try {
            const response = await profileAPI.update(formData);
            setShowProfileModal(false);
            showSuccess('Profile updated successfully!');
            // Update local user state and localStorage immediately
            if (response.data && response.data.user) {
                setUser(response.data.user);
                setCurrentUser(response.data.user);
            } else {
                // Fallback: reload from API
                await loadUserInfo();
            }
            // Reset profile form
            setProfileForm({
                first_name: '',
                last_name: '',
                middle_initial: '',
                profile_picture: null,
            });
        } catch (error) {
            console.error('Profile update error:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to update profile. Please try again.';
            showError(errorMessage);
        }
    };

    const showAddEmployeeForm = () => {
        setEditingEmployee(null);
        setEmployeeForm({
            number: '',
            firstname: '',
            lastname: '',
            description: '',
            image: null,
        });
        setEmployeeError('');
        setShowEmployeeModal(true);
    };

    const editEmployee = async (employeeId) => {
        try {
            const { data: employee } = await employeeAPI.get(employeeId);
            setEditingEmployee(employee);
            setEmployeeForm({
                number: employee.number,
                firstname: employee.firstname,
                lastname: employee.lastname,
                description: employee.description || '',
                image: null,
            });
            setEmployeeError('');
            setShowEmployeeModal(true);
        } catch (error) {
            showError('Failed to load employee details');
        }
    };

    const saveEmployee = async () => {
        // Validate required fields - trim whitespace
        const number = (employeeForm.number || '').trim();
        const firstname = (employeeForm.firstname || '').trim();
        const lastname = (employeeForm.lastname || '').trim();

        if (!number || !firstname || !lastname) {
            setEmployeeError('Employee number, first name, and last name are required');
            return;
        }

        const formData = new FormData();
        formData.append('number', number);
        formData.append('firstname', firstname);
        formData.append('lastname', lastname);
        formData.append('description', (employeeForm.description || '').trim());

        if (employeeForm.image && employeeForm.image instanceof File) {
            // Validate file size (max 2MB)
            if (employeeForm.image.size > 2 * 1024 * 1024) {
                setEmployeeError('Image size must be less than 2MB');
                return;
            }
            // Validate file type
            if (!employeeForm.image.type.match('image.*')) {
                setEmployeeError('Please select a valid image file');
                return;
            }
            formData.append('image', employeeForm.image);
            console.log('Appending employee image:', employeeForm.image.name, employeeForm.image.size, employeeForm.image.type);
        }

        // Debug: Log FormData contents
        console.log('Sending employee data:', {
            number,
            firstname,
            lastname,
            description: employeeForm.description,
            hasImage: !!employeeForm.image,
            imageType: employeeForm.image ? typeof employeeForm.image : 'null',
            imageIsFile: employeeForm.image instanceof File,
            editing: !!editingEmployee
        });
        
        // Debug: Log FormData entries
        if (employeeForm.image) {
            for (let pair of formData.entries()) {
                console.log('FormData entry:', pair[0], pair[1]);
            }
        }

        setEmployeeError('');

        try {
            if (editingEmployee) {
                const response = await employeeAPI.update(editingEmployee.id, formData);
                showSuccess('Employee updated successfully!');
            } else {
                await employeeAPI.create(formData);
                showSuccess('Employee created successfully!');
            }
            setShowEmployeeModal(false);
            setEditingEmployee(null);
            // Reset form
            setEmployeeForm({
                number: '',
                firstname: '',
                lastname: '',
                description: '',
                image: null,
            });
            setEmployeeError('');
            await loadMyEmployees();
        } catch (error) {
            console.error('Employee save error:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to save employee. Please try again.';
            setEmployeeError(errorMessage);
            showError(errorMessage);
        }
    };

    const deleteEmployee = async (employeeId) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) {
            return;
        }

        try {
            await employeeAPI.delete(employeeId);
            showSuccess('Employee deleted successfully!');
            loadMyEmployees();
        } catch (error) {
            showError(error.response?.data?.error || 'Network error. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const fullName = user.first_name && user.last_name
        ? `${user.first_name} ${user.middle_initial ? user.middle_initial + '. ' : ''}${user.last_name}`
        : user.username;

    const handleBack = () => {
        const role = user?.role || getCurrentUser()?.role;
        const path = getRoleRedirectPath(role);
        navigate(path);
    };

    return (
        <div className="container mt-4">
                {/* Back Button */}
                <div className="mb-3">
                    <button className="btn btn-secondary" onClick={handleBack}>
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                </div>

                {/* User Info Section */}
                <div className="row mb-4">
                    <div className="col-md-4 mx-auto">
                        <div className="card">
                            <div className="card-header bg-info text-white">
                                <h5><i className="fas fa-user"></i> Profile Information</h5>
                            </div>
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    <div className="profile-picture-container position-relative d-inline-block">
                                        <img
                                            id="profilePicture"
                                            src={user.profile_picture && user.profile_picture !== 'null' && user.profile_picture !== ''
                                                ? `/uploads/${user.profile_picture}?t=${Date.now()}`
                                                : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02NCA2NEM3MS4xNjM0IDY0IDc3IDU4LjE2MzQgNzcgNTBDNzcgNDEuODM2NiA3MS4xNjM0IDM2IDY0IDM2QzU2LjgzNjYgMzYgNTEgNDEuODM2NiA1MSA1MEM1MSA1OC4xNjM0IDU2LjgzNjYgNjQgNjQgNjRaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik02NCA3MkM0OS42NDA2IDcyIDM4IDgxLjY0MDYgMzggOTRWMTAwSDkwVjk0QzkwIDgxLjY0MDYgNzguMzU5NCA3MiA2NCA3MloiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+'}
                                            alt="Default Profile"
                                            className="profile-picture rounded-circle"
                                            style={{ width: '128px', height: '128px', objectFit: 'cover', cursor: 'pointer' }}
                                            onError={(e) => {
                                                // Fallback to default if image fails to load
                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02NCA2NEM3MS4xNjM0IDY0IDc3IDU4LjE2MzQgNzcgNTBDNzcgNDEuODM2NiA3MS4xNjM0IDM2IDY0IDM2QzU2LjgzNjYgMzYgNTEgNDEuODM2NiA1MSA1MEM1MSA1OC4xNjM0IDU2LjgzNjYgNjQgNjQgNjRaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik02NCA3MkM0OS42NDA2IDcyIDM4IDgxLjY0MDYgMzggOTRWMTAwSDkwVjk0QzkwIDgxLjY0MDYgNzguMzU5NCA3MiA2NCA3MloiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+';
                                            }}
                                        />
                                        <div
                                            className="profile-picture-overlay position-absolute"
                                            style={{
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                width: '128px',
                                                height: '128px',
                                                background: 'rgba(0,0,0,0.5)',
                                                borderRadius: '50%',
                                                display: 'none',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.display = 'flex'}
                                            onMouseLeave={(e) => e.currentTarget.style.display = 'none'}
                                        >
                                            <label htmlFor="profilePictureInput" className="btn btn-sm btn-primary mb-0" style={{ cursor: 'pointer', margin: 0 }}>
                                                <i className="fas fa-camera"></i> Change
                                            </label>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        id="profilePictureInput"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleProfilePictureChange}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div>
                                    <h6 className="text-muted mb-3">{fullName}</h6>
                                    <p><strong>Username:</strong> {user.username}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    <p><strong>Member since:</strong> {formatDate(user.created_at || new Date())}</p>
                                </div>
                                <button className="btn btn-primary btn-block mt-3" onClick={editProfile}>
                                    <i className="fas fa-edit"></i> Edit Profile
                                </button>
                                <button className="btn btn-secondary btn-block mt-2" onClick={() => setShowPasswordModal(true)}>
                                    <i className="fas fa-key"></i> Change Password
                                </button>
                                <button 
                                    className="btn btn-danger btn-block mt-2" 
                                    onClick={async () => {
                                        try {
                                            await authAPI.logout();
                                        } catch (error) {
                                            console.error('Logout error:', error);
                                        } finally {
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('user');
                                            showSuccess('Logged out successfully');
                                            navigate('/login');
                                        }
                                    }}
                                    style={{ fontSize: '16px', fontWeight: 'bold', padding: '10px' }}
                                >
                                    <i className="fas fa-sign-out-alt"></i> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Edit Modal */}
                {showProfileModal && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Profile</h5>
                                    <button type="button" className="close" onClick={() => setShowProfileModal(false)}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="editFirstName">
                                                    <i className="fas fa-user"></i> First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="editFirstName"
                                                    value={profileForm.first_name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="editLastName">
                                                    <i className="fas fa-user"></i> Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="editLastName"
                                                    value={profileForm.last_name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="editMiddleInitial">
                                            <i className="fas fa-user"></i> Middle Initial (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="editMiddleInitial"
                                            value={profileForm.middle_initial}
                                            onChange={(e) => setProfileForm({ ...profileForm, middle_initial: e.target.value })}
                                            maxLength="5"
                                            placeholder="e.g., A"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="editProfilePicture">
                                            <i className="fas fa-camera"></i> Profile Picture
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control-file"
                                            id="editProfilePicture"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files && e.target.files[0];
                                                if (file) {
                                                    console.log('Profile picture file selected:', file.name, file.size, file.type);
                                                    setProfileForm({ ...profileForm, profile_picture: file });
                                                } else {
                                                    setProfileForm({ ...profileForm, profile_picture: null });
                                                }
                                            }}
                                        />
                                        <small className="form-text text-muted">Leave empty to keep current picture</small>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="button" className="btn btn-primary" onClick={saveProfile}>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Change Password Modal */}
                {showPasswordModal && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Change Password</h5>
                                    <button type="button" className="close" onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordError('');
                                        setPasswordForm({
                                            current_password: '',
                                            new_password: '',
                                            new_password_confirmation: '',
                                        });
                                    }}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label htmlFor="currentPassword">
                                            <i className="fas fa-lock"></i> Current Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="currentPassword"
                                            value={passwordForm.current_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                            required
                                            autoComplete="current-password"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="newPassword">
                                            <i className="fas fa-key"></i> New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="newPassword"
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                            required
                                            minLength="6"
                                            autoComplete="new-password"
                                        />
                                        <small className="form-text text-muted">Must be at least 6 characters long</small>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">
                                            <i className="fas fa-key"></i> Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="confirmPassword"
                                            value={passwordForm.new_password_confirmation}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                                            required
                                            minLength="6"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    {passwordError && (
                                        <div className="alert alert-danger">{passwordError}</div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordError('');
                                        setPasswordForm({
                                            current_password: '',
                                            new_password: '',
                                            new_password_confirmation: '',
                                        });
                                    }}>
                                        Cancel
                                    </button>
                                    <button type="button" className="btn btn-primary" onClick={changePassword}>
                                        <i className="fas fa-save"></i> Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Employee modals removed for simplified profile-only view */}
        </div>
    );
}

export default Profile;
