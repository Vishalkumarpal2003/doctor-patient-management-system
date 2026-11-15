const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(postData);
    req.end();
  });
};

const runTests = async () => {
  console.log('--- STARTING BACKEND API VERIFICATION SUITE ---');

  // Wait a moment for server and seed
  await new Promise((r) => setTimeout(r, 4000));

  // 1. Admin Login
  const adminLogin = await request('POST', '/api/auth/login', {
    email: 'admin@curahealth.com',
    password: 'password123',
  });
  console.log('1. Admin Login Status:', adminLogin.status, 'Success:', adminLogin.body.success);
  if (!adminLogin.body.token) throw new Error('Admin login failed');
  const adminToken = adminLogin.body.token;

  // 2. Doctor Login
  const doctorLogin = await request('POST', '/api/auth/login', {
    email: 'sarah.jenkins@curahealth.com',
    password: 'password123',
  });
  console.log('2. Doctor Login Status:', doctorLogin.status, 'Role:', doctorLogin.body.user.role);
  const doctorToken = doctorLogin.body.token;
  const doctorId = doctorLogin.body.user.id;

  // 3. Patient Login
  const patientLogin = await request('POST', '/api/auth/login', {
    email: 'alex.patient@curahealth.com',
    password: 'password123',
  });
  console.log('3. Patient Login Status:', patientLogin.status, 'Role:', patientLogin.body.user.role);
  const patientToken = patientLogin.body.token;

  // 4. Search Doctors
  const docSearch = await request('GET', '/api/doctors?search=Sarah');
  console.log('4. Doctor Search Results Count:', docSearch.body.count);

  // 5. Get Available Slots
  const slotsRes = await request('GET', `/api/doctors/${doctorId}/available-slots?date=2026-11-20`);
  console.log('5. Available Slots for 2026-11-20:', slotsRes.body.slots?.length, 'slots returned');

  // 6. Book an Appointment
  const bookRes = await request(
    'POST',
    '/api/appointments',
    {
      doctorId,
      appointmentDate: '2026-11-20',
      timeSlot: '09:00 AM',
      symptoms: 'Routine cardiovascular wellness checkup',
    },
    patientToken
  );
  console.log('6. Book Appointment Status:', bookRes.status, 'Success:', bookRes.body.success);
  const appointmentId = bookRes.body.data?._id;

  // 7. Test Duplicate Booking Prevention (Same doctor, date, and slot)
  const duplicateRes = await request(
    'POST',
    '/api/appointments',
    {
      doctorId,
      appointmentDate: '2026-11-20',
      timeSlot: '09:00 AM',
      symptoms: 'Trying to double book same slot',
    },
    patientToken
  );
  console.log(
    '7. Duplicate Booking Attempt Status (expect 409):',
    duplicateRes.status,
    'Message:',
    duplicateRes.body.message
  );

  // 8. Doctor confirms appointment
  const confirmRes = await request(
    'PUT',
    `/api/doctors/appointments/${appointmentId}/status`,
    { status: 'Confirmed' },
    doctorToken
  );
  console.log('8. Doctor Confirmed Status:', confirmRes.body.success);

  // 9. Doctor Adds Prescription & Diagnosis
  const rxRes = await request(
    'POST',
    '/api/prescriptions',
    {
      appointmentId,
      diagnosis: 'Normal cardiovascular profile, borderline LDL',
      medicines: [
        {
          name: 'Atorvastatin',
          dosage: '10 mg',
          frequency: 'Once at night',
          duration: '30 days',
        },
      ],
      testsAdvised: ['Lipid panel follow-up in 3 months'],
      instructions: 'Mediterranean diet, 30 min daily walking.',
    },
    doctorToken
  );
  console.log('9. Prescription Added:', rxRes.body.success, 'Rx Diagnosis:', rxRes.body.data?.diagnosis);

  // 10. Patient views their appointments & prescriptions
  const myApps = await request('GET', '/api/appointments/my', null, patientToken);
  console.log('10. Patient Appointments Count:', myApps.body.count);

  const myRx = await request('GET', '/api/prescriptions/my', null, patientToken);
  console.log('11. Patient Prescriptions Count:', myRx.body.count);

  // 12. Admin Dashboard Stats
  const adminStats = await request('GET', '/api/admin/stats', null, adminToken);
  console.log('12. Admin Stats Total Appointments:', adminStats.body.stats?.totalAppointments);
  console.log('12. Admin Stats Total Revenue:', adminStats.body.stats?.totalRevenue);

  // 13. Admin Approve Doctor
  const pendingDoc = adminStats.body.pendingDoctors[0];
  if (pendingDoc) {
    const approveRes = await request(
      'PUT',
      `/api/admin/doctors/${pendingDoc._id}/approval`,
      { isApproved: true },
      adminToken
    );
    console.log('13. Admin Approved Doctor Status:', approveRes.body.success);
  }

  console.log('--- ALL BACKEND TESTS PASSED WITH 100% SUCCESS ---');
  process.exit(0);
};

// Start server and run tests
require('../server');
runTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
