import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import { FaUserMd, FaPlus, FaTrash } from 'react-icons/fa';

const specializations = [
  'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic',
  'Pediatrician', 'Psychiatrist', 'Dentist', 'General Physician',
  'Gynecologist', 'Ophthalmologist', 'ENT Specialist', 'Urologist'
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    specialization: '',
    experience: '',
    fees: '',
    about: '',
    availableSlots: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/doctors/profile/me');
        setForm({
          specialization: data.specialization || '',
          experience: data.experience || '',
          fees: data.fees || '',
          about: data.about || '',
          availableSlots: data.availableSlots || []
        });
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const addSlot = () => {
    setForm({
      ...form,
      availableSlots: [
        ...form.availableSlots,
        { day: 'Monday', startTime: '09:00', endTime: '17:00' }
      ]
    });
  };

  const removeSlot = (index) => {
    setForm({
      ...form,
      availableSlots: form.availableSlots.filter((_, i) => i !== index)
    });
  };

  const updateSlot = (index, field, value) => {
    const updated = form.availableSlots.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    );
    setForm({ ...form, availableSlots: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/doctors/profile', {
        ...form,
        experience: Number(form.experience),
        fees: Number(form.fees)
      });
      toast.success('Profile updated successfully!');
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary-50 w-12 h-12 rounded-xl flex items-center justify-center">
            <FaUserMd className="text-primary-600 text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
            <p className="text-gray-500 text-sm">Update your doctor information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization *
            </label>
            <select
              value={form.specialization}
              onChange={e => setForm({ ...form, specialization: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              required>
              <option value="">Select specialization</option>
              {specializations.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Experience + Fees */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (years) *
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={form.experience}
                onChange={e => setForm({ ...form, experience: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
  Consultation Fees (LKR) *
</label>
<div className="relative">
  <span className="absolute left-4 top-3 text-gray-500 font-medium text-sm">
    Rs.
  </span>
  <input
    type="number"
    min="0"
    value={form.fees}
    onChange={e => setForm({ ...form, fees: e.target.value })}
    className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
    required
  />
</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              About You
            </label>
            <textarea
              value={form.about}
              onChange={e => setForm({ ...form, about: e.target.value })}
              rows={4}
              placeholder="Describe your expertise, education, achievements..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Available Time Slots
              </label>
              <button
                type="button"
                onClick={addSlot}
                className="flex items-center gap-1 text-primary-600 text-sm font-medium hover:text-primary-700">
                <FaPlus size={12} /> Add Slot
              </button>
            </div>
            <div className="space-y-3">
              {form.availableSlots.map((slot, i) => (
                <div key={i}
                  className="flex gap-3 items-center bg-gray-50 rounded-xl p-3">
                  <select
                    value={slot.day}
                    onChange={e => updateSlot(i, 'day', e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    {days.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={e => updateSlot(i, 'startTime', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={e => updateSlot(i, 'endTime', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeSlot(i)}
                    className="text-red-400 hover:text-red-600">
                    <FaTrash size={13} />
                  </button>
                </div>
              ))}
              {form.availableSlots.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-3">
                  No slots added. Click "Add Slot" to add availability.
                </p>
              )}
            </div>
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
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;