import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import {
  FaStar, FaClock, FaPhone, FaEnvelope,
  FaCalendarAlt, FaCheckCircle
} from 'react-icons/fa';

const DoctorProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [form, setForm] = useState({
    date: '',
    time: '',
    problem: ''
  });

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

  useEffect(() => {
    if (form.date && doctor) {
      fetchBookedSlots();
      generateAvailableTimes();
    }
  }, [form.date, doctor]);

  const fetchBookedSlots = async () => {
    try {
      const { data } = await API.get(
        `/appointments/booked-slots/${id}?date=${form.date}`
      );
      setBookedSlots(data.bookedTimes);
    } catch (err) {
      console.error(err);
    }
  };

  const generateAvailableTimes = () => {
    if (!doctor || !form.date) return;

    const selectedDate = new Date(form.date);
    const dayName = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long'
    });

    // Find slot for that day
    const daySlot = doctor.availableSlots?.find(
      slot => slot.day === dayName
    );

    if (!daySlot) {
      setAvailableTimes([]);
      return;
    }

    // Generate 30-minute intervals
    const times = [];
    const [startHour, startMin] = daySlot.startTime.split(':').map(Number);
    const [endHour, endMin] = daySlot.endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      times.push(timeStr);

      currentMin += 30;
      if (currentMin >= 60) {
        currentMin -= 60;
        currentHour += 1;
      }
    }

    setAvailableTimes(times);
    setForm(prev => ({ ...prev, time: '' }));
  };

  const isTimeBooked = (time) => bookedSlots.includes(time);

  const isDayAvailable = (date) => {
    if (!date || !doctor) return true;
    const selectedDate = new Date(date);
    const dayName = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long'
    });
    return doctor.availableSlots?.some(slot => slot.day === dayName);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }

    if (!form.date || !form.time) {
      toast.error('Please select date and time');
      return;
    }

    if (!isDayAvailable(form.date)) {
      toast.error('Doctor is not available on this day');
      return;
    }

    if (isTimeBooked(form.time)) {
      toast.error('This time slot is already booked');
      return;
    }

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
    <div className="text-center py-20 text-gray-400">
      Doctor not found
    </div>
  );

  const docUser = doctor.userId;

  const today = new Date().toISOString().split('T')[0];

  const availableDays = doctor.availableSlots?.map(s => s.day) || [];

  const todayDay = new Date().toLocaleDateString('en-US', {
    weekday: 'long'
  });
  const isAvailableToday = availableDays.includes(todayDay);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex gap-6 items-start">
              <img
                src={docUser?.photo ||
                  `https://ui-avatars.com/api/?name=${docUser?.name}&background=0ea5e9&color=fff&size=128`}
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
                  <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                    Rs. {doctor.fees?.toLocaleString('en-LK')} LKR
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <FaPhone size={12} />
                    {docUser?.phone || 'Not provided'}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <FaEnvelope size={12} />
                    {docUser?.email}
                  </div>
                </div>

                <div className="mt-3">
                  {isAvailableToday ? (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      Available Today
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-xs font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      Not Available Today
                    </span>
                  )}
                </div>
              </div>
            </div>

            {doctor.about && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2">About</h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {doctor.about}
                </p>
              </div>
            )}
          </div>

          {doctor.availableSlots?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaClock className="text-primary-600" />
                Available Days and Hours
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctor.availableSlots.map((slot, i) => {
                  const isToday = slot.day === todayDay;
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
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    min={today}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    required
                  />
                  {availableDays.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Available: {availableDays.join(', ')}
                    </p>
                  )}
                  {/* Show warning if day not available */}
                  {form.date && !isDayAvailable(form.date) && (
                    <p className="text-xs text-red-500 mt-1 font-medium">
                      Doctor is not available on this day. Please choose another date.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time Slot
                  </label>

                  {!form.date && (
                    <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 text-center">
                      Please select a date first
                    </p>
                  )}

                  {form.date && !isDayAvailable(form.date) && (
                    <p className="text-xs text-red-500 bg-red-50 rounded-xl p-3 text-center">
                      No slots available on this day
                    </p>
                  )}

                  {form.date && isDayAvailable(form.date) && availableTimes.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {availableTimes.map((time, i) => {
                        const booked = isTimeBooked(time);
                        const selected = form.time === time;
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={booked}
                            onClick={() => setForm({ ...form, time })}
                            className={`py-2 px-1 rounded-xl text-xs font-medium transition border ${
                              booked
                                ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed line-through'
                                : selected
                                ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600'
                            }`}>
                            {booked ? (
                              <span className="flex flex-col items-center">
                                <span>{time}</span>
                                <span className="text-xs">Booked</span>
                              </span>
                            ) : selected ? (
                              <span className="flex flex-col items-center">
                                <FaCheckCircle size={10} className="mb-0.5" />
                                <span>{time}</span>
                              </span>
                            ) : (
                              time
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {form.date && isDayAvailable(form.date) && availableTimes.length > 0 && (
                    <div className="flex gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-gray-50 border border-gray-100"></div>
                        <span className="text-xs text-gray-400">Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-primary-600"></div>
                        <span className="text-xs text-gray-400">Selected</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-red-50 border border-red-100"></div>
                        <span className="text-xs text-gray-400">Booked</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problem Description
                  </label>
                  <textarea
                    value={form.problem}
                    onChange={e => setForm({ ...form, problem: e.target.value })}
                    placeholder="Describe your symptoms..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none text-sm"
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-sm text-green-700 font-medium">
                    Consultation Fee:
                    <span className="font-bold ml-1">
                      Rs. {doctor.fees?.toLocaleString('en-LK')} LKR
                    </span>
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Payment collected at the hospital
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={booking || !form.date || !form.time || !isDayAvailable(form.date)}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
                  {booking ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-gray-500 mb-4 text-sm">
                  {user
                    ? 'Only patients can book appointments'
                    : 'Login as a patient to book'}
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