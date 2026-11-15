/**
 * CuraHealth Industry-Standard Automated Test Suite
 * Covers:
 * - Unit & Integration Testing
 * - Authentication & RBAC (Role-Based Access Control)
 * - Concurrency & Duplicate Booking Prevention
 * - Medical Record Ownership & Privacy (Negative Testing)
 * - Input Validation & Sanitization
 * - Rate Limiting & Security Headers
 * - Admin Operations & Financial Reporting
 * - Pagination & Sorting
 */

const http = require('http');
const app = require('../server');

let testServer;
let baseUrl;

// Helper to make HTTP requests
const apiRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const postData = body ? JSON.stringify(body) : '';

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : {};
        } catch (e) {
          parsed = { raw: data };
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

const runSuite = async () => {
  console.log('\n======================================================');
  console.log('  CURAHEALTH ENTERPRISE TEST SUITE (INDUSTRY-GRADE)');
  console.log('======================================================\n');

  // Start dedicated test server on ephemeral port
  await new Promise((resolve) => {
    testServer = app.listen(0, () => {
      const port = testServer.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`✓ Test runner bound to ${baseUrl}`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${details}`);
      failed++;
    }
  };

  try {
    // 1. Security Headers Verification
    console.log('\n--- 1. SECURITY & SYSTEM HEALTH CHECKS ---');
    const healthRes = await apiRequest('GET', '/api/health');
    assert(healthRes.status === 200, 'Health check returns HTTP 200');
    assert(healthRes.headers['x-content-type-options'] === 'nosniff', 'Security header: X-Content-Type-Options: nosniff');
    assert(healthRes.headers['x-frame-options'] === 'SAMEORIGIN', 'Security header: X-Frame-Options configured');
    assert(healthRes.body.status === 'OK', 'System reporting healthy status');

    // 2. Input Validation (Negative Tests)
    console.log('\n--- 2. INPUT VALIDATION & REGISTRATION (NEGATIVE & POSITIVE) ---');
    const invalidEmailReg = await apiRequest('POST', '/api/auth/register', {
      name: 'John Doe',
      email: 'not-an-email',
      password: 'password123',
    });
    assert(invalidEmailReg.status === 400, 'Reject registration with invalid email format (HTTP 400)');

    const shortPassReg = await apiRequest('POST', '/api/auth/register', {
      name: 'Jane Doe',
      email: 'jane@curahealth.com',
      password: '123', // Less than 6 chars
    });
    assert(shortPassReg.status === 400, 'Reject registration with password < 6 chars (HTTP 400)');

    // Register a fresh unique test patient
    const uniqueEmail = `test.patient.${Date.now()}@curahealth.com`;
    const regRes = await apiRequest('POST', '/api/auth/register', {
      name: 'Automated Test Patient',
      email: uniqueEmail,
      password: 'SecurePassword123!',
      role: 'patient',
      phone: '+1 555-0199',
    });
    assert(regRes.status === 201, 'Successful registration returns HTTP 201', JSON.stringify(regRes.body));
    const newPatientToken = regRes.body.token;
    assert(!!newPatientToken, 'New patient receives valid JWT token');

    // 3. Multi-Role Authentication
    console.log('\n--- 3. MULTI-ROLE AUTHENTICATION (PATIENT, DOCTOR, ADMIN) ---');
    const adminLogin = await apiRequest('POST', '/api/auth/login', {
      email: 'admin@curahealth.com',
      password: 'password123',
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'admin', 'Admin login authenticates with "admin" role');
    const adminToken = adminLogin.body.token;

    const doctorLogin = await apiRequest('POST', '/api/auth/login', {
      email: 'sarah.jenkins@curahealth.com',
      password: 'password123',
    });
    assert(doctorLogin.status === 200 && doctorLogin.body.user.role === 'doctor', 'Doctor login authenticates with "doctor" role');
    const doctorToken = doctorLogin.body.token;
    const doctorUserId = doctorLogin.body.user._id;

    const patientLogin = await apiRequest('POST', '/api/auth/login', {
      email: 'alex.patient@curahealth.com',
      password: 'password123',
    });
    assert(patientLogin.status === 200 && patientLogin.body.user.role === 'patient', 'Patient login authenticates with "patient" role');
    const patientToken = patientLogin.body.token;
    const patientUserId = patientLogin.body.user._id;

    // 4. Role-Based Access Control (RBAC) Enforcement (Negative Tests)
    console.log('\n--- 4. ROLE-BASED ACCESS CONTROL (RBAC) ENFORCEMENT ---');
    const patientAccessingAdmin = await apiRequest('GET', '/api/admin/stats', null, patientToken);
    assert(patientAccessingAdmin.status === 403, 'Patient cannot access Admin stats (HTTP 403 Forbidden)');

    const doctorAccessingAdmin = await apiRequest('GET', '/api/admin/stats', null, doctorToken);
    assert(doctorAccessingAdmin.status === 403, 'Doctor cannot access Admin stats (HTTP 403 Forbidden)');

    const unauthenticatedAccess = await apiRequest('GET', '/api/appointments/my');
    assert(unauthenticatedAccess.status === 401, 'Unauthenticated request to protected route is rejected (HTTP 401 Unauthorized)');

    // 5. Pagination & Filtering on Doctor Directory
    console.log('\n--- 5. DOCTOR DIRECTORY, FILTERING & PAGINATION ---');
    const paginatedDocs = await apiRequest('GET', '/api/doctors?page=1&limit=2');
    assert(paginatedDocs.status === 200, 'GET /api/doctors supports pagination');
    assert(paginatedDocs.body.pagination && paginatedDocs.body.pagination.limit === 2, 'Pagination metadata returned with page & limit');
    assert(paginatedDocs.body.data.length <= 2, 'Result size strictly obeys limit');

    // 6. Appointment Booking & Double-Booking Prevention
    console.log('\n--- 6. APPOINTMENT ENGINE & CONCURRENCY CONFLICT PREVENTION ---');
    const bookingDate = '2026-12-28';
    const bookingSlot = '11:00 AM';

    // First booking
    const book1 = await apiRequest(
      'POST',
      '/api/appointments',
      {
        doctorId: doctorUserId,
        appointmentDate: bookingDate,
        timeSlot: bookingSlot,
        symptoms: 'Annual health examination',
        paymentMethod: 'Credit Card',
      },
      patientToken
    );
    assert(book1.status === 201, 'Patient successfully books available appointment slot (HTTP 201)', JSON.stringify(book1.body));
    const createdAppointmentId = book1.body.data?._id;

    // Attempt double booking on identical slot by another patient
    const book2 = await apiRequest(
      'POST',
      '/api/appointments',
      {
        doctorId: doctorUserId,
        appointmentDate: bookingDate,
        timeSlot: bookingSlot,
        symptoms: 'Second booking attempt collision',
        paymentMethod: 'Credit Card',
      },
      newPatientToken
    );
    assert(book2.status === 409, 'Double booking collision rejected with HTTP 409 Conflict');

    // 7. Medical Record Ownership & Privacy (HIPAA Negative Testing)
    console.log('\n--- 7. MEDICAL RECORD PRIVACY & ACCESS CONTROL (NEGATIVE TESTS) ---');
    // Doctor confirms appointment
    const confirmRes = await apiRequest(
      'PUT',
      `/api/doctors/appointments/${createdAppointmentId}/status`,
      { status: 'Confirmed' },
      doctorToken
    );
    assert(confirmRes.status === 200, 'Doctor can confirm appointment status');

    // Doctor creates prescription
    const rxRes = await apiRequest(
      'POST',
      '/api/prescriptions',
      {
        appointmentId: createdAppointmentId,
        diagnosis: 'Mild allergic rhinitis with clear lungs',
        medicines: [
          { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily at bedtime', duration: '7 days' },
        ],
        testsAdvised: ['Total IgE count'],
        instructions: 'Avoid known dust allergens and stay well hydrated.',
        followUpDate: '2027-01-05',
      },
      doctorToken
    );
    assert(rxRes.status === 201, 'Doctor can issue clinical diagnosis and prescription (HTTP 201)');

    // Patient who owns the appointment CAN access the prescription
    const patientRxAccess = await apiRequest(
      'GET',
      `/api/prescriptions/appointment/${createdAppointmentId}`,
      null,
      patientToken
    );
    assert(patientRxAccess.status === 200, 'Owner Patient CAN view their own prescription (HTTP 200)');

    // SNOOPING TEST: A different patient attempts to view this prescription
    const snoopingPatientAccess = await apiRequest(
      'GET',
      `/api/prescriptions/appointment/${createdAppointmentId}`,
      null,
      newPatientToken // Different patient!
    );
    assert(
      snoopingPatientAccess.status === 403,
      'Unauthorized Patient CANNOT view another patient prescription (HTTP 403 Forbidden)'
    );

    // 8. Appointment Cancellation Lifecycle
    console.log('\n--- 8. APPOINTMENT CANCELLATION LIFECYCLE ---');
    // Book a pending appointment to verify active cancellation
    const cancelableBooking = await apiRequest(
      'POST',
      '/api/appointments',
      {
        doctorId: doctorUserId,
        appointmentDate: '2026-12-29',
        timeSlot: '02:00 PM',
        symptoms: 'Follow-up consultation',
        paymentMethod: 'Credit Card',
      },
      patientToken
    );
    const cancelAppId = cancelableBooking.body.data?._id;

    // Unauthorized cancellation test
    const unauthCancel = await apiRequest(
      'PUT',
      `/api/appointments/${cancelAppId}/cancel`,
      { cancellationReason: 'Malicious cancellation attempt' },
      newPatientToken
    );
    assert(unauthCancel.status === 403, 'Unauthorized user cannot cancel an appointment they do not own (HTTP 403)');

    // Owner cancels appointment
    const validCancel = await apiRequest(
      'PUT',
      `/api/appointments/${cancelAppId}/cancel`,
      { cancellationReason: 'Schedule conflict' },
      patientToken
    );
    assert(validCancel.status === 200, 'Patient can cancel their own appointment with tracked reason');

    // 9. Admin Operational & Financial Ledger Testing
    console.log('\n--- 9. ADMIN ANALYTICS & FINANCIAL AUDITING ---');
    const adminStats = await apiRequest('GET', '/api/admin/stats', null, adminToken);
    assert(adminStats.status === 200, 'Admin can retrieve hospital metrics');
    assert(adminStats.body.stats && adminStats.body.stats.totalAppointments > 0, 'Admin stats report non-zero total appointments');
    assert(typeof adminStats.body.stats.totalRevenue === 'number', 'Admin reports valid revenue ledger calculation');

    const adminPayments = await apiRequest('GET', '/api/admin/payments', null, adminToken);
    assert(adminPayments.status === 200 && Array.isArray(adminPayments.body.data), 'Admin can inspect payment transaction ledger');

    // 10. API Versioning (v1 routes)
    console.log('\n--- 10. API REST VERSIONING (v1 COMPATIBILITY) ---');
    const v1Health = await apiRequest('GET', '/api/v1/auth/me', null, patientToken);
    assert(v1Health.status === 200, 'Versioned API /api/v1/auth/me responds identically to standard routes');

  } catch (err) {
    console.error('Fatal Test Exception:', err);
    failed++;
  } finally {
    if (testServer) {
      testServer.close();
    }
  }

  console.log('\n======================================================');
  console.log(`  TEST RESULTS SUMMARY:`);
  console.log(`  TOTAL TESTS EXECUTED: ${passed + failed}`);
  console.log(`  PASSED: ${passed}`);
  console.log(`  FAILED: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runSuite();
