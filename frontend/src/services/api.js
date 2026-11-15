import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Request interceptor to add Authorization token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me'),
  updateProfile: (profileData) => API.put('/auth/profile', profileData),
  changePassword: (passwordData) => API.put('/auth/change-password', passwordData),
};

// Doctor Services
export const doctorService = {
  getAll: (params) => API.get('/doctors', { params }),
  getById: (id) => API.get(`/doctors/${id}`),
  getAvailableSlots: (doctorId, date) =>
    API.get(`/doctors/${doctorId}/available-slots`, { params: { date } }),
  getMyAppointments: (params) => API.get('/doctors/my/appointments', { params }),
  getStats: () => API.get('/doctors/dashboard/stats'),
  updateAppointmentStatus: (id, data) => API.put(`/doctors/appointments/${id}/status`, data),
};

// Appointment Services
export const appointmentService = {
  book: (bookingData) => API.post('/appointments', bookingData),
  getMy: (params) => API.get('/appointments/my', { params }),
  getById: (id) => API.get(`/appointments/${id}`),
  cancel: (id, cancellationReason) =>
    API.put(`/appointments/${id}/cancel`, { cancellationReason }),
};

// Prescription Services
export const prescriptionService = {
  create: (prescriptionData) => API.post('/prescriptions', prescriptionData),
  getMy: () => API.get('/prescriptions/my'),
  getByAppointment: (appointmentId) => API.get(`/prescriptions/appointment/${appointmentId}`),
  getPatientPrescriptions: (patientId) => API.get(`/prescriptions/patient/${patientId}`),
};

// Admin Services
export const adminService = {
  getStats: () => API.get('/admin/stats'),
  getDoctors: (params) => API.get('/admin/doctors', { params }),
  setApproval: (id, isApproved) => API.put(`/admin/doctors/${id}/approval`, { isApproved }),
  getPatients: (params) => API.get('/admin/patients', { params }),
  toggleUserStatus: (id) => API.put(`/admin/users/${id}/toggle-status`),
  getAppointments: (params) => API.get('/admin/appointments', { params }),
  getPayments: () => API.get('/admin/payments'),
};

export default API;
