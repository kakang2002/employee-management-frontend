// Utility functions for notifications
export const showSuccess = (message) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
    successDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    successDiv.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 5000);
};

export const showError = (message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    errorDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert">
            <span>&times;</span>
        </button>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

// Get current user
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Set/replace current user in localStorage
export const setCurrentUser = (user) => {
    if (!user) {
        localStorage.removeItem('user');
        return;
    }
    localStorage.setItem('user', JSON.stringify(user));
};

// Format currency
export const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toLocaleString()}`;
};

// Format date
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};

// Format datetime
export const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
};

// Check user role
export const isAdmin = () => {
    const user = getCurrentUser();
    return user?.role === 'admin';
};

export const isHRManager = () => {
    const user = getCurrentUser();
    return user?.role === 'hr_manager';
};

export const isEmployee = () => {
    const user = getCurrentUser();
    return user?.role === 'employee';
};

// Get role-based redirect path
export const getRoleRedirectPath = (role) => {
    switch (role) {
        case 'admin':
            return '/admin/dashboard';
        case 'hr_manager':
            return '/hr/dashboard';
        case 'employee':
            return '/employee/dashboard';
        default:
            return '/profile';
    }
};

