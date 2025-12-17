import axios from 'axios';

// API Base URL - Change this to your Hostinger backend URL
// Priority:
// 1) VITE_API_URL (set in .env when building)
// 2) If running on GitHub Pages (hostname ends with github.io), use absolute API URL
// 3) Fallback to same-origin '/api' for local dev
// ⚠️ IMPORTANT: Replace 'your-backend-domain.com' with your actual Hostinger backend domain
// Example: 'https://employee-api.example.com/api' or 'https://example.com/api'
const PRODUCTION_API_URL = 'https://your-backend-domain.com/api'; // ⚠️ CHANGE THIS!

const API_BASE_URL =
    import.meta.env.VITE_API_URL
    || (typeof window !== 'undefined' && /\.github\.io$/.test(window.location.hostname)
        ? PRODUCTION_API_URL  // For GitHub Pages, use your backend domain
        : import.meta.env.MODE === 'production' 
            ? PRODUCTION_API_URL  // For production builds
            : '/api'); // For local development

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Accept': 'application/json',
        // Don't set Content-Type here - it will be set automatically
        // For FormData, axios will set multipart/form-data with boundary
        // For JSON, we'll set it in the interceptor
    },
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Handle Content-Type based on data type
        if (config.data instanceof FormData) {
            // Don't set Content-Type for FormData - let axios/browser set it automatically with boundary
            // Remove Content-Type header completely for FormData
            delete config.headers['Content-Type'];
            delete config.headers['content-type'];
            // Also remove from common property
            if (config.headers.common) {
                delete config.headers.common['Content-Type'];
            }
        } else if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
            // Set JSON Content-Type only if not FormData and not already set
            if (!config.headers['Content-Type'] && !config.headers['content-type']) {
                config.headers['Content-Type'] = 'application/json';
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/register', data),
    login: (data) => api.post('/login', data),
    logout: () => api.post('/logout'),
    resendVerification: (email) => api.post('/email/resend', { email }),
    forgotPassword: (email) => api.post('/forgot-password', { email }),
    resetPassword: (data) => api.post('/reset-password', data),
};

// Profile API
export const profileAPI = {
    get: () => api.get('/profile'),
    update: (formData) => {
        // Use POST with _method=PUT for file uploads (PUT doesn't work well with FormData)
        formData.append('_method', 'PUT');
        return api.post('/profile', formData, {
            // Don't set Content-Type - let axios set it automatically with boundary
            // This is required for FormData to work correctly
        });
    },
    changePassword: (data) => api.post('/profile/change-password', data),
};

// Employee API
export const employeeAPI = {
    getAll: () => api.get('/employees'),
    get: (id) => api.get(`/employees/${id}`),
    getUserEmployees: () => api.get('/read'),
    create: (formData) => api.post('/create', formData, {
        // Don't set Content-Type - let axios set it automatically with boundary
        // This is required for FormData to work correctly
    }),
    update: (id, formData) => {
        // Use POST with _method=PUT for file uploads (PUT doesn't work well with FormData)
        formData.append('_method', 'PUT');
        return api.post(`/update/${id}`, formData, {
            // Don't set Content-Type - let axios set it automatically with boundary
            // This is required for FormData to work correctly
        });
    },
    delete: (id) => api.delete(`/delete/${id}`),
};

// Admin API
export const adminAPI = {
    dashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    createUser: (data) => api.post('/admin/users', data),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getEmployees: () => api.get('/admin/employees'),
    createEmployee: (data) => api.post('/admin/employees', data),
    updateEmployee: (id, data) => {
        // Use POST with _method=PUT for file uploads (PUT doesn't work well with FormData)
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return api.post(`/admin/employees/${id}`, data);
        }
        return api.put(`/admin/employees/${id}`, data);
    },
    deleteEmployee: (id) => api.delete(`/admin/employees/${id}`),
    getAttendance: (params) => api.get('/admin/attendance', { params }),
    getPayroll: () => api.get('/admin/payroll'),
    updatePayroll: (id, data) => api.put(`/admin/payroll/${id}`, data),
    deletePayroll: (id) => api.delete(`/admin/payroll/${id}`),
    getLogs: (params) => api.get('/admin/logs', { params }),
};

// HR Manager API
export const hrAPI = {
    dashboard: () => api.get('/hr/dashboard'),
    getEmployees: () => api.get('/hr/employees'),
    updateEmployee: (id, data) => api.put(`/hr/employees/${id}`, data),
    getAttendance: (params) => api.get('/hr/attendance', { params }),
    updateAttendance: (id, data) => api.put(`/hr/attendance/${id}`, data),
    getLeaveRequests: (params) => api.get('/hr/leave-requests', { params }),
    approveLeave: (id) => api.put(`/hr/leave-requests/${id}/approve`),
    rejectLeave: (id, reason) => api.put(`/hr/leave-requests/${id}/reject`, { rejection_reason: reason }),
    getTimeSettings: () => api.get('/hr/time-settings'),
    updateTimeSettings: (data) => api.put('/hr/time-settings', data),
    getPayroll: () => api.get('/hr/payroll'),
    generatePayroll: (data) => api.post('/hr/payroll/generate', data),
    updatePayroll: (id, data) => api.put(`/hr/payroll/${id}`, data),
    deletePayroll: (id) => api.delete(`/hr/payroll/${id}`),
    attendanceReport: (params) => api.get('/hr/reports/attendance', { params }),
    leaveReport: (params) => api.get('/hr/reports/leave', { params }),
};

// Employee Self-Service API
export const employeeServiceAPI = {
    dashboard: () => api.get('/employee/dashboard'),
    timeIn: () => api.post('/employee/attendance/time-in'),
    timeOut: () => api.post('/employee/attendance/time-out'),
    getAttendance: (params) => api.get('/employee/attendance', { params }),
    canRequestLeave: () => api.get('/employee/can-request-leave'),
    submitLeaveRequest: (data) => api.post('/employee/leave-request', data),
    getLeaveRequests: (params) => api.get('/employee/leave-requests', { params }),
    getPayslips: (params) => api.get('/employee/payslips', { params }),
    downloadPayslip: (id) => api.get(`/employee/payslips/${id}/download`),
};

export default api;

