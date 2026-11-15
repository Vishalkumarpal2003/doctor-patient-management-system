import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-md">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Cura<span className="text-sky-400">Health</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Modern digital healthcare platform connecting verified specialists with patients for
              seamless appointment bookings, clinical records, and continuous care.
            </p>
            <div className="flex items-center space-x-2 text-xs text-sky-400">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA-Compliant & Secure Data</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home Portal
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-white transition">
                  Find Doctors & Specialists
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Our Hospital Network
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Patient & Doctor Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Create an Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Medical Specialties */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Specialties
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Cardiology & Heart Care</li>
              <li>Neurology & Spine Health</li>
              <li>Dermatology & Skin Center</li>
              <li>Pediatrics & Child Wellness</li>
              <li>Orthopedics & Joint Surgery</li>
              <li>General Internal Medicine</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              24/7 Helpline
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                <span>450 Medical Heights Blvd, Central City Health Park</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>Emergency: +1 (800) 456-7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>support@curahealth.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>Mon - Sun: 24 Hours Emergency Care</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 CuraHealth Doctor-Patient Management System. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built with MERN Stack • React, Node.js, Express & MongoDB</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
