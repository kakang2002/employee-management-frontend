import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Layout/Navbar';
import ProtectedRoute from './Common/ProtectedRoute';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Profile from './Pages/Profile';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import AdminDashboard from './Pages/AdminDashboard';
import AdminUsers from './Pages/AdminUsers';
import AdminEmployees from './Pages/AdminEmployees';
import AdminAttendance from './Pages/AdminAttendance';
import AdminPayroll from './Pages/AdminPayroll';
import AdminLogs from './Pages/AdminLogs';
import HRDashboard from './Pages/HRDashboard';
import HREmployees from './Pages/HREmployees';
import HRAttendance from './Pages/HRAttendance';
import HRLeaveRequests from './Pages/HRLeaveRequests';
import HRPayroll from './Pages/HRPayroll';
import HRReports from './Pages/HRReports';
import EmployeeDashboard from './Pages/EmployeeDashboard';
import EmployeeAttendance from './Pages/EmployeeAttendance';
import EmployeePayslips from './Pages/EmployeePayslips';
import EmployeeLeaveRequest from './Pages/EmployeeLeaveRequest';
import EmployeeLeaveRequests from './Pages/EmployeeLeaveRequests';
import HRTimeSettings from './Pages/HRTimeSettings';
import { isAuthenticated, getCurrentUser, getRoleRedirectPath } from '../utils/helpers';

function App() {
    // Helper to redirect authenticated users to their role-based dashboard
    const getDefaultRedirect = () => {
        if (isAuthenticated()) {
            const user = getCurrentUser();
            return getRoleRedirectPath(user?.role);
        }
        return '/profile';
    };

    return (
        <div className="App">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route 
                    path="/login" 
                    element={isAuthenticated() ? <Navigate to={getDefaultRedirect()} /> : <Login />} 
                />
                <Route 
                    path="/register" 
                    element={isAuthenticated() ? <Navigate to={getDefaultRedirect()} /> : <Register />} 
                />
                <Route 
                    path="/forgot-password" 
                    element={isAuthenticated() ? <Navigate to={getDefaultRedirect()} /> : <ForgotPassword />} 
                />
                <Route 
                    path="/reset-password" 
                    element={isAuthenticated() ? <Navigate to={getDefaultRedirect()} /> : <ResetPassword />} 
                />
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } 
                />

                {/* Admin Routes */}
                <Route 
                    path="/admin/dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/users" 
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminUsers />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/employees" 
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminEmployees />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/attendance" 
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminAttendance />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/payroll" 
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminPayroll />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/logs" 
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminLogs />
                        </ProtectedRoute>
                    } 
                />

                {/* HR Manager Routes */}
                <Route 
                    path="/hr/dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}>
                            <HRDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/hr/employees" 
                    element={
                        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}>
                            <HREmployees />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/hr/attendance" 
                    element={
                        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}>
                            <HRAttendance />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/hr/time-settings" 
                    element={
                        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}>
                            <HRTimeSettings />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/hr/leave-requests" 
                    element={
                        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}>
                            <HRLeaveRequests />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/hr/payroll" 
                    element={
                        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}>
                            <HRPayroll />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/hr/reports" 
                    element={
                        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}>
                            <HRReports />
                        </ProtectedRoute>
                    } 
                />

                {/* Employee Self-Service Routes */}
                <Route 
                    path="/employee/dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['employee', 'hr_manager', 'admin']}>
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/employee/attendance" 
                    element={
                        <ProtectedRoute allowedRoles={['employee', 'hr_manager', 'admin']}>
                            <EmployeeAttendance />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/employee/leave-request" 
                    element={
                        <ProtectedRoute allowedRoles={['employee', 'hr_manager', 'admin']}>
                            <EmployeeLeaveRequest />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/employee/leave-requests" 
                    element={
                        <ProtectedRoute allowedRoles={['employee', 'hr_manager', 'admin']}>
                            <EmployeeLeaveRequests />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/employee/payslips" 
                    element={
                        <ProtectedRoute allowedRoles={['employee', 'hr_manager', 'admin']}>
                            <EmployeePayslips />
                        </ProtectedRoute>
                    } 
                />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}

export default App;

