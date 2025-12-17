import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../../utils/helpers';

function ProtectedRoute({ children, allowedRoles = [] }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const user = getCurrentUser();
    
    // If specific roles are required, check if user has one of them
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Redirect to appropriate dashboard based on role
        const rolePaths = {
            admin: '/admin/dashboard',
            hr_manager: '/hr/dashboard',
            employee: '/employee/dashboard'
        };
        const redirectPath = rolePaths[user?.role] || '/profile';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
}

export default ProtectedRoute;








