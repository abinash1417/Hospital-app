import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { FaStar, FaClock, FaPhone, FaEnvelope } from 'react-icons/fa';

const DoctorProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({ date: '', time: '', problem: '' });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await API.get(`/doctors/${id}`);
        setDoctor(data);
      } catch (err) {
        toast.error('Doctor not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setBooking(true);
    try {
      await API.post('/appointments', {
        doctorId: id,
        ...form
      });
      toast.success('Appointment booked successfully!');
      navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <Spinner />;
  if (!doctor) return (
    <div className="text-center py-20 text-gray-400">Doctor not found</div>
  );

  const docUser = doctor.userId;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Doctor Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex gap-6 items-start">
              <img
                src={docUser?.photo || `https://ui-avatars.com/api/?name=${docUser?.name}&background=0ea5e9&color=fff&size=128`}
                alt={docUser?.name}
                className="w-28 h-28 rounded-2xl object-cover border-4 border-primary-100"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">
                  Dr. {docUser?.name}
                </h1>
                <p className="text-primary-600 font-medium mt-1">
                  {doctor.specialization}
                </p>
                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    <FaStar size={14} />
                    <span className="text-sm text-gray-600">
                      {doctor.experience} years experience
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
  <span className="text-sm font-medium">Rs.</span>
  <span className="text-sm text-gray-600">
    {doctor.fees?.toLocaleString('en-LK')} consultation fee (LKR)
  </span>
</div>
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <FaPhone size={12} />
                    {docUser?.phone || 'Not provided'}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <FaEnvelope size={12} />
                    {docUser?.email}
                  </div>
                </div>
              </div>
            </div>

            {doctor.about && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2">About</h3>
                <p className="text-gray-500 leading-relaxed">{doctor.about}</p>
              </div>
            )}
          </div>

{doctor.availableSlots?.length > 0 && (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <FaClock className="text-primary-600" />
      Available Days & Hours
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {doctor.availableSlots.map((slot, i) => {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const isToday = slot.day === today;
        return (
          <div key={i}
            className={`rounded-xl p-3 flex justify-between items-center ${
              isToday
                ? 'bg-green-50 border border-green-200'
                : 'bg-gray-50 border border-gray-100'
            }`}>
            <div className="flex items-center gap-2">
              {isToday && (
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              )}
              <span className={`font-medium text-sm ${
                isToday ? 'text-green-700' : 'text-gray-700'
              }`}>
                {slot.day} {isToday && '(Today)'}
              </span>
            </div>
            <span className={`text-xs font-medium ${
              isToday ? 'text-green-600' : 'text-gray-500'
            }`}>
              {slot.startTime} - {slot.endTime}
            </span>
          </div>
        );
      })}
    </div>
  </div>
)}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-gray-800 text-lg mb-5">
              Book Appointment
            </h3>
            {user?.role === 'patient' ? (
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problem Description
                  </label>
                  <textarea
                    value={form.problem}
                    onChange={e => setForm({ ...form, problem: e.target.value })}
                    placeholder="Describe your symptoms..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
                  />
                </div>

                {/* Fees reminder */}
<div className="bg-green-50 border border-green-200 rounded-xl p-3">
  <p className="text-sm text-green-700 font-medium">
    💳 Consultation Fee:
    <span className="font-bold ml-1">
      Rs. {doctor.fees?.toLocaleString('en-LK')} LKR
    </span>
  </p>
  <p className="text-xs text-green-600 mt-0.5">
    Payment is collected at the hospital
  </p>
</div>
                <button
                  type="submit"
                  disabled={booking}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-60">
                  {booking ? 'Booking...' : 'Book Appointment'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">
                  {user ? 'Only patients can book appointments' : 'Login as a patient to book'}
                </p>
                {!user && (
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-primary-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-700 transition">
                    Login to Book
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;