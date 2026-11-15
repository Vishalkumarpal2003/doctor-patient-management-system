import React from 'react';
import { Shield, Award, HeartPulse, Clock, Users, Building2, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider">
          <HeartPulse className="w-4 h-4 text-sky-600" />
          <span>About CuraHealth Hospital</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Pioneering Excellence in Modern Patient Care
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Established to bridge medical technology with compassionate bedside care, CuraHealth
          operates as an integrated digital healthcare facility delivering outpatient and specialist services.
        </p>
      </div>

      {/* Hospital Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Safety & Trust First</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            All doctors undergo rigorous verification of medical board credentials, state licenses,
            and clinical history before receiving consult authorization.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Clinical Excellence</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            From multi-specialty cardiology to pediatric medicine, our clinical protocols follow
            international evidence-based standards.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Real-Time Scheduling</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our booking engine ensures patients only see real, confirmed openings, preventing
            over-scheduling and eliminating unnecessary waiting room times.
          </p>
        </div>
      </div>

      {/* Hospital Details & Stats */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-sky-400 text-xs font-bold uppercase tracking-wider">
              Our Infrastructure
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              State-of-the-Art Facilities & Diagnostics
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Equipped with digital radiology, fully automated clinical pathology labs, and
              high-speed electronic health record synchronization so doctors have complete medical
              histories instantly.
            </p>

            <ul className="space-y-2.5 pt-2 text-sm text-slate-200">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span>Encrypted medical records & prescriptions</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span>Multi-channel consultation fee payments with instant receipts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span>Dedicated administrative monitoring & quality controls</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <Building2 className="w-8 h-8 text-sky-400 mb-2" />
              <p className="text-2xl font-black text-white">6</p>
              <p className="text-xs text-slate-400">Clinical Specialty Units</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <Users className="w-8 h-8 text-sky-400 mb-2" />
              <p className="text-2xl font-black text-white">50K+</p>
              <p className="text-xs text-slate-400">Patient Consultations</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <Award className="w-8 h-8 text-sky-400 mb-2" />
              <p className="text-2xl font-black text-white">99.4%</p>
              <p className="text-xs text-slate-400">Diagnostic Accuracy</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <Clock className="w-8 h-8 text-sky-400 mb-2" />
              <p className="text-2xl font-black text-white">24/7</p>
              <p className="text-xs text-slate-400">Emergency Triage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
