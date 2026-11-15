import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../services/api';
import {
  Calendar,
  ShieldCheck,
  Clock,
  HeartPulse,
  Users,
  Award,
  ArrowRight,
  Star,
  CheckCircle,
  Activity,
  PhoneCall,
  MapPin,
} from 'lucide-react';

const specialties = [
  { name: 'Cardiology', icon: HeartPulse, desc: 'Heart care, ECG & echocardiogram' },
  { name: 'Neurology', icon: Activity, desc: 'Brain, spine & neuromuscular care' },
  { name: 'Dermatology', icon: ShieldCheck, desc: 'Skin health, acne & clinical therapies' },
  { name: 'Pediatrics', icon: Users, desc: 'Child health, immunization & care' },
  { name: 'Orthopedic', icon: Award, desc: 'Joint replacement, bones & sports injury' },
  { name: 'General Physician', icon: Clock, desc: 'Primary care & preventive health' },
];

const Home = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorService.getAll();
        setFeaturedDoctors(res.data.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured doctors:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-slate-50 pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
                <HeartPulse className="w-4 h-4 text-sky-600" />
                <span>Next-Generation Healthcare Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Your Health, Our Priority.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">
                  Care You Can Trust.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect with verified board-certified physicians, check real-time time slots, book
                appointments with instant confirmation, and access digital prescriptions securely.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/doctors"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2 transition hover:-translate-y-0.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </Link>

                <Link
                  to="/about"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm shadow-sm flex items-center justify-center space-x-2 transition"
                >
                  <span>Explore Medical Services</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/60 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-2xl font-black text-slate-900">50K+</p>
                  <p className="text-xs text-slate-500 font-medium">Patients Treated</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Verified Doctors</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">4.9 / 5</p>
                  <p className="text-xs text-slate-500 font-medium">Patient Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-slate-100 relative">
                  <img
                    src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
                    alt="Medical team"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-4">
                    <p className="text-white text-xs font-semibold">
                      CuraHealth Medical Center • Dedicated Clinical Excellence
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 border border-sky-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Real-Time Scheduling</p>
                        <p className="text-[11px] text-slate-500">Live slot updates & instant booking</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-sky-700 bg-white px-2 py-1 rounded shadow-xs">
                      Live
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Zero Double Booking</p>
                        <p className="text-[11px] text-slate-500">Automated conflict prevention</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-1 rounded shadow-xs">
                      Safe
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Specialties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-600">Specialized Medicine</p>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            Comprehensive Clinical Departments
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Explore dedicated specialties led by distinguished medical practitioners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((spec, i) => {
            const Icon = spec.icon;
            return (
              <Link
                key={i}
                to={`/doctors?specialization=${encodeURIComponent(spec.name)}`}
                className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/5 transition duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center transition mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition">
                  {spec.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{spec.desc}</p>
                <div className="mt-4 flex items-center text-xs font-bold text-sky-600 group-hover:translate-x-1 transition">
                  <span>Browse Specialists</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sky-600">Our Experts</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Featured Doctors</h2>
            <p className="text-sm text-slate-600 mt-1">
              Top-rated clinicians ready for in-person and digital consultations.
            </p>
          </div>
          <Link
            to="/doctors"
            className="mt-4 sm:mt-0 text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center"
          >
            <span>View All Doctors</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loadingDoctors ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDoctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition flex flex-col"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={
                        doc.user?.avatar ||
                        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
                      }
                      alt={doc.user?.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-100"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{doc.user?.name}</h3>
                      <p className="text-xs font-semibold text-sky-600">{doc.specialization}</p>
                      <div className="flex items-center space-x-1 mt-1 text-xs text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{doc.rating || 4.9}</span>
                        <span className="text-slate-400 font-normal">
                          ({doc.totalReviews || 18} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {doc.about}
                  </p>

                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block">Consultation Fee</span>
                      <span className="text-base font-extrabold text-slate-900">${doc.fees}</span>
                    </div>
                    <Link
                      to={`/book-appointment?doctorId=${doc.user?._id}`}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition"
                    >
                      Book Slot
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-sky-700 to-blue-800 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              Hospital Management Reimagined
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to schedule your appointment?
            </h2>
            <p className="text-sm sm:text-base text-sky-100 leading-relaxed">
              Experience fast, modern, and transparent healthcare. Register in less than a minute
              or browse doctors today.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-white text-sky-800 hover:bg-sky-50 font-bold text-sm shadow-md transition"
              >
                Create Free Account
              </Link>
              <Link
                to="/doctors"
                className="px-6 py-3 rounded-xl bg-sky-600/60 hover:bg-sky-600 text-white font-bold text-sm border border-sky-400/40 transition"
              >
                Find A Specialist
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
