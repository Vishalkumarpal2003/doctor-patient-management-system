import React, { useState, useEffect } from 'react';
import { prescriptionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Calendar,
  User,
  Pill,
  Clock,
  Printer,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PrescriptionViewModal from '../components/patient/PrescriptionViewModal';

const MedicalRecords = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await prescriptionService.getMy();
        setPrescriptions(res.data.data || []);
      } catch (err) {
        console.error('Error fetching medical records:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const handleOpenPrescription = (rx) => {
    setSelectedPrescription(rx);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Medical Records & Prescriptions
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Access your digital prescriptions, clinical diagnoses, advised tests, and doctor notes.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your medical records..." size="lg" />
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No medical records yet</h3>
          <p className="text-xs text-slate-500">
            Once you complete a consultation with your doctor, your clinical diagnosis and
            prescriptions will be automatically archived here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((rx) => (
            <div
              key={rx._id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-sky-300 hover:shadow-md transition flex flex-col overflow-hidden"
            >
              <div className="p-6 flex-1 flex flex-col space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{rx.doctor?.name}</p>
                      <p className="text-[10px] text-sky-600">
                        {rx.doctor?.doctorProfile?.specialization || 'Specialist'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {rx.appointment?.appointmentDate ||
                      new Date(rx.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Diagnosis */}
                <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100">
                  <span className="text-[10px] uppercase font-bold text-sky-800 block tracking-wider">
                    Diagnosis
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{rx.diagnosis}</p>
                </div>

                {/* Medicines Preview */}
                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center">
                    <Pill className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Medications ({rx.medicines?.length || 0})
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {rx.medicines?.slice(0, 3).map((m, idx) => (
                      <li key={idx} className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-800">• {m.name}</span>
                        <span className="text-slate-500">{m.dosage}</span>
                      </li>
                    ))}
                    {rx.medicines?.length > 3 && (
                      <li className="text-[10px] text-slate-400 italic">
                        +{rx.medicines.length - 3} more medicines
                      </li>
                    )}
                  </ul>
                </div>

                {/* Instructions preview */}
                {rx.instructions && (
                  <p className="text-xs text-slate-500 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{rx.instructions}"
                  </p>
                )}

                {/* Card footer */}
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                  {rx.followUpDate ? (
                    <span className="text-[10px] text-sky-700 font-semibold flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Follow-up: {rx.followUpDate}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Routine Rx</span>
                  )}

                  <button
                    onClick={() => handleOpenPrescription(rx)}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    View Prescription
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && selectedPrescription && (
        <PrescriptionViewModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          prescription={selectedPrescription}
        />
      )}
    </div>
  );
};

export default MedicalRecords;
