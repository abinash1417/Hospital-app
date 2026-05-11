import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import { FaPlus, FaTrash, FaFileMedical } from 'react-icons/fa';

const frequencies = [
  'Once a day',
  'Twice a day',
  'Three times a day',
  'Four times a day',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed'
];

const durations = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '1 month',
  '3 months',
  'Ongoing'
];

const WritePrescription = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [form, setForm] = useState({
    diagnosis: '',
    medicines: [
      {
        name: '',
        dosage: '',
        frequency: 'Twice a day',
        duration: '7 days',
        instructions: ''
      }
    ],
    notes: '',
    followUpDate: ''
  });

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const { data } = await API.get('/appointments/doctor');
      const apt = data.find(a => a._id === appointmentId);
      if (!apt) {
        toast.error('Appointment not found');
        navigate('/doctor/dashboard');
        return;
      }
      setAppointment(apt);
    } catch (err) {
      toast.error('Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = () => {
    setForm({
      ...form,
      medicines: [
        ...form.medicines,
        {
          name: '',
          dosage: '',
          frequency: 'Twice a day',
          duration: '7 days',
          instructions: ''
        }
      ]
    });
  };

  const removeMedicine = (index) => {
    setForm({
      ...form,
      medicines: form.medicines.filter((_, i) => i !== index)
    });
  };

  const updateMedicine = (index, field, value) => {
    const updated = form.medicines.map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    );
    setForm({ ...form, medicines: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diagnosis.trim()) {
      toast.error('Please enter diagnosis');
      return;
    }
    if (form.medicines.some(m => !m.name.trim())) {
      toast.error('Please enter all medicine names');
      return;
    }
    setSaving(true);
    try {
      await API.post('/prescriptions', {
        appointmentId,
        patientId: appointment.patientId._id,
        ...form
      });
      toast.success('Prescription created successfully!');
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary-50 w-12 h-12 rounded-xl flex items-center justify-center">
            <FaFileMedical className="text-primary-600 text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Write Prescription
            </h1>
            <p className="text-gray-500 text-sm">
              Patient: {appointment?.patientId?.name}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Patient:</span>
              <span className="font-medium text-gray-800 ml-2">
                {appointment?.patientId?.name}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Date:</span>
              <span className="font-medium text-gray-800 ml-2">
                {appointment?.date}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Problem:</span>
              <span className="font-medium text-gray-800 ml-2">
                {appointment?.problem || 'General consultation'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Booking Ref:</span>
              <span className="font-medium text-green-600 ml-2">
                {appointment?.bookingNumber}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis *
            </label>
            <textarea
              value={form.diagnosis}
              onChange={e => setForm({ ...form, diagnosis: e.target.value })}
              placeholder="Enter diagnosis details..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Medicines *
              </label>
              <button
                type="button"
                onClick={addMedicine}
                className="flex items-center gap-1 text-primary-600 text-sm font-medium hover:text-primary-700">
                <FaPlus size={12} /> Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {form.medicines.map((med, i) => (
                <div key={i}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      Medicine {i + 1}
                    </span>
                    {form.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(i)}
                        className="text-red-400 hover:text-red-600">
                        <FaTrash size={13} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Medicine Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Paracetamol 500mg"
                        value={med.name}
                        onChange={e => updateMedicine(i, 'name', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1 tablet"
                        value={med.dosage}
                        onChange={e => updateMedicine(i, 'dosage', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Frequency *
                      </label>
                      <select
                        value={med.frequency}
                        onChange={e => updateMedicine(i, 'frequency', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                        {frequencies.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Duration *
                      </label>
                      <select
                        value={med.duration}
                        onChange={e => updateMedicine(i, 'duration', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                        {durations.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">
                        Special Instructions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Take after meals"
                        value={med.instructions}
                        onChange={e => updateMedicine(i, 'instructions', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Any additional instructions or notes..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Date (Optional)
            </label>
            <input
              type="date"
              value={form.followUpDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm({ ...form, followUpDate: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/doctor/dashboard')}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WritePrescription;