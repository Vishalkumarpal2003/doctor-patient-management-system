import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { prescriptionService } from '../../services/api';
import { Plus, Trash2, Pill, AlertCircle, CheckCircle2 } from 'lucide-react';

const PrescriptionModal = ({ isOpen, onClose, appointment, onPrescriptionSaved }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '' },
  ]);
  const [testsAdvised, setTestsAdvised] = useState('');
  const [instructions, setInstructions] = useState('Take medicines on time and drink plenty of fluids.');
  const [followUpDate, setFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (appointment?._id && isOpen) {
      // Check if prescription already exists
      const fetchExisting = async () => {
        try {
          const res = await prescriptionService.getByAppointment(appointment._id);
          if (res.data?.data) {
            const rx = res.data.data;
            setDiagnosis(rx.diagnosis || '');
            setMedicines(
              rx.medicines && rx.medicines.length > 0
                ? rx.medicines
                : [{ name: '', dosage: '', frequency: '', duration: '' }]
            );
            setTestsAdvised(rx.testsAdvised ? rx.testsAdvised.join(', ') : '');
            setInstructions(rx.instructions || '');
            setFollowUpDate(rx.followUpDate || '');
          }
        } catch (e) {
          // No prescription yet - reset form
          setDiagnosis('');
          setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
          setTestsAdvised('');
          setInstructions('Take medicines as directed.');
          setFollowUpDate('');
        }
      };
      fetchExisting();
      setError('');
      setSuccess('');
    }
  }, [appointment, isOpen]);

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setError('Please provide a medical diagnosis.');
      return;
    }

    const filteredMedicines = medicines.filter((m) => m.name.trim() !== '');

    setLoading(true);
    setError('');
    try {
      const payload = {
        appointmentId: appointment._id,
        diagnosis,
        medicines: filteredMedicines,
        testsAdvised: testsAdvised
          ? testsAdvised.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        instructions,
        followUpDate: followUpDate || null,
      };

      const res = await prescriptionService.create(payload);
      setSuccess('Prescription and diagnosis saved successfully!');
      if (onPrescriptionSaved) {
        onPrescriptionSaved(res.data.data);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Clinical Diagnosis & Prescription • ${appointment.patient?.name || 'Patient'}`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Patient Appointment Summary */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-wrap gap-4 justify-between">
          <div>
            <span className="font-semibold text-slate-800">Date:</span> {appointment.appointmentDate}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Time:</span> {appointment.timeSlot}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Symptoms:</span>{' '}
            {appointment.symptoms || 'General Checkup'}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Blood Group:</span>{' '}
            {appointment.patient?.patientProfile?.bloodGroup || 'Not specified'}
          </div>
        </div>

        {/* Diagnosis */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Clinical Diagnosis <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Acute Pharyngitis, Stage 1 Hypertension, Contact Dermatitis"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
        </div>

        {/* Prescribed Medicines */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
              <Pill className="w-4 h-4 mr-1.5 text-sky-600" />
              Prescribed Medications
            </label>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center py-1 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 transition"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Medicine
            </button>
          </div>

          <div className="space-y-2.5">
            {medicines.map((med, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 items-center"
              >
                <div className="col-span-12 sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Medicine Name (e.g. Amoxicillin)"
                    value={med.name}
                    onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Dosage (500mg)"
                    value={med.dosage}
                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="col-span-4 sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Freq (1-0-1 after food)"
                    value={med.frequency}
                    onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Duration (5 days)"
                    value={med.duration}
                    onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(index)}
                    disabled={medicines.length === 1}
                    className="text-slate-400 hover:text-rose-500 disabled:opacity-30 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tests Advised */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Diagnostic Tests Advised (Comma-separated)
          </label>
          <input
            type="text"
            value={testsAdvised}
            onChange={(e) => setTestsAdvised(e.target.value)}
            placeholder="e.g. Complete Blood Count (CBC), Serum Electrolytes, Chest X-Ray"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        {/* Instructions & Follow-up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Doctor's Dietary & Lifestyle Instructions
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Drink warm fluids, avoid cold air exposure, take rest."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Follow-Up Review Date (Optional)
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Saving this prescription automatically sets appointment status to 'Completed'.
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/30 transition disabled:opacity-50"
          >
            {loading ? 'Saving Record...' : 'Save & Complete Visit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PrescriptionModal;
