import React, { useRef } from 'react';
import Modal from '../common/Modal';
import { Printer, HeartPulse, Pill, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';

const PrescriptionViewModal = ({ isOpen, onClose, prescription }) => {
  const printRef = useRef(null);

  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const doctorName = prescription.doctor?.name || 'Dr. Specialist';
  const doctorSpec = prescription.doctor?.doctorProfile?.specialization || 'Consultant Physician';
  const doctorQual = prescription.doctor?.doctorProfile?.qualifications?.join(', ') || 'MBBS, MD';
  const patientName = prescription.patient?.name || 'Patient';
  const patientPhone = prescription.patient?.phone || 'N/A';
  const patientGender = prescription.patient?.gender || 'N/A';
  const dateStr = prescription.appointment?.appointmentDate || new Date(prescription.createdAt).toLocaleDateString();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Medical Prescription & Clinical Record"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Printable Prescription Card */}
        <div
          ref={printRef}
          className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm space-y-6 print:border-none print:shadow-none print:p-0"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white">
                <HeartPulse className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Cura<span className="text-sky-600">Health</span> Hospital
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Center for Advanced Medical Care & Specialist Outpatient
                </p>
                <p className="text-[11px] text-slate-400">
                  Tel: +1 (800) 456-7890 • clinic@curahealth.com
                </p>
              </div>
            </div>

            <div className="text-right">
              <h3 className="text-sm font-bold text-slate-900">{doctorName}</h3>
              <p className="text-xs font-semibold text-sky-600">{doctorSpec}</p>
              <p className="text-[11px] text-slate-500">{doctorQual}</p>
            </div>
          </div>

          {/* Patient Details Sub-header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Patient Name</span>
              <span className="font-bold text-slate-800">{patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Phone</span>
              <span className="font-semibold text-slate-800">{patientPhone}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Gender</span>
              <span className="font-semibold text-slate-800 capitalize">{patientGender}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Consultation Date</span>
              <span className="font-bold text-sky-700">{dateStr}</span>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-800 mb-1 flex items-center">
              <FileText className="w-4 h-4 mr-1 text-sky-600" />
              Primary Diagnosis
            </h4>
            <p className="text-base font-bold text-slate-900">{prescription.diagnosis}</p>
          </div>

          {/* Medicines (Rx) */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl font-serif font-black text-sky-600 italic">Rx</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Prescribed Medications
              </h4>
            </div>

            {prescription.medicines && prescription.medicines.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Medicine Name</th>
                      <th className="py-2.5 px-3">Dosage</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prescription.medicines.map((med, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{med.name}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">{med.dosage}</td>
                        <td className="py-2.5 px-3 text-slate-600">{med.frequency}</td>
                        <td className="py-2.5 px-3 font-semibold text-sky-700">{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No oral medications prescribed.</p>
            )}
          </div>

          {/* Tests Advised */}
          {prescription.testsAdvised && prescription.testsAdvised.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Diagnostic Investigations / Tests Advised
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                {prescription.testsAdvised.map((test, index) => (
                  <li key={index} className="font-medium">
                    {test}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          {prescription.instructions && (
            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Doctor's Special Instructions
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {prescription.instructions}
              </p>
            </div>
          )}

          {/* Follow-up & Footer Stamp */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-t border-slate-200 pt-5 gap-4">
            <div>
              {prescription.followUpDate && (
                <div className="inline-flex items-center text-xs font-semibold text-sky-800 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                  Follow-up Review Scheduled:{' '}
                  <span className="font-bold ml-1">{prescription.followUpDate}</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="inline-block border-b border-slate-400 w-44 mb-1"></div>
              <p className="text-xs font-bold text-slate-800">{doctorName}</p>
              <p className="text-[10px] text-slate-400">Digitally Verified & Signed</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Prescription
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PrescriptionViewModal;
