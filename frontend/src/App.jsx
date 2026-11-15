import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';

// Dynamic Imports with React.lazy for Code Splitting & Performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Doctors = lazy(() => import('./pages/Doctors'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const BookAppointment = lazy(() => import('./pages/BookAppointment'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const MedicalRecords = lazy(() => import('./pages/MedicalRecords'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Page loading fallback
const PageFallback = () => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <LoadingSpinner text="Loading CuraHealth..." size="lg" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
            <Navbar />
            <main className="flex-grow" id="main-content" tabIndex="-1">
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/doctors" element={<Doctors />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Patient Protected Routes */}
                  <Route
                    path="/patient-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/book-appointment"
                    element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <BookAppointment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/medical-records"
                    element={
                      <ProtectedRoute allowedRoles={['patient']}>
                        <MedicalRecords />
                      </ProtectedRoute>
                    }
                  />

                  {/* Doctor Protected Routes */}
                  <Route
                    path="/doctor-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['doctor']}>
                        <DoctorDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Protected Routes */}
                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
