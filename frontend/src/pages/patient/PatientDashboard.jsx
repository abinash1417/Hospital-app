import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import PhotoUpload from '../../components/PhotoUpload';
import toast from 'react-hot-toast';
import {
  FaCalendarAlt, FaTimes, FaFileMedical,
  FaHistory, FaRobot
} from 'react-icons/fa';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700'
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await API.get('/appointments/my');
        setAppointments(data);
      } catch (err) {
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await API.put(`/appointments/${id}/cancel`);
      setAppointments(appointments.map(a =>
        a._id === id ? { ...a, status: 'cancelled' } : a
      ));
      toast.success('Appointment cancelled');
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          <PhotoUpload
            currentPhoto={user?.photo}
            name={user?.name}
          />

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-500 mt-1">{user?.email}</p>
            <p className="text-gray-400 text-sm mt-1">{user?.phone}</p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
            <button
              onClick={() => navigate('/patient/symptom-checker')}
              className="border border-blue-500 text-blue-600 px-4 py-2.5 rounded-xl font-medium hover:bg-blue-50 transition text-sm flex items-center gap-2">
              <FaRobot size={13} />
              Symptom Checker
            </button>
            <button
              onClick={() => navigate('/patient/medical-history')}
              className="border border-purple-500 text-purple-600 px-4 py-2.5 rounded-xl font-medium hover:bg-purple-50 transition text-sm flex items-center gap-2">
              <FaHistory size={13} />
              Medical History
            </button>
            <button
              onClick={() => navigate('/patient/prescriptions')}
              className="border border-green-500 text-green-600 px-4 py-2.5 rounded-xl font-medium hover:bg-green-50 transition text-sm flex items-center gap-2">
              <FaFileMedical size={13} />
              My Prescriptions
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="border border-primary-600 text-primary-600 px-4 py-2.5 rounded-xl font-medium hover:bg-primary-50 transition text-sm">
              Contact Admin
            </button>
            <button
              onClick={() => navigate('/doctors')}
              className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition">
              + Book Appointment
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total',
            count: appointments.length,
            color: 'bg-blue-50 text-blue-700'
          },
          {
            label: 'Pending',
            count: appointments.filter(a => a.status === 'pending').length,
            color: 'bg-amber-50 text-amber-700'
          },
          {
            label: 'Confirmed',
            count: appointments.filter(a => a.status === 'confirmed').length,
            color: 'bg-green-50 text-green-700'
          },
          {
            label: 'Completed',
            count: appointments.filter(a => a.status === 'completed').length,
            color: 'bg-purple-50 text-purple-700'
          },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-2xl p-4 text-center`}>
            <div className="text-2xl font-bold">{stat.count}</div>
            <div className="text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <FaCalendarAlt className="text-primary-600" />
            My Appointments
          </h2>
        </div>

        {loading ? <Spinner /> : appointments.length === 0 ? (
          <div className="text-center py-16">
            <FaCalendarAlt className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No appointments yet</p>
            <button
              onClick={() => navigate('/doctors')}
              className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-700 transition">
              Find a Doctor
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {appointments.map(apt => {
              const doc = apt.doctorId?.userId;
              return (
                <div key={apt._id}
                  className="p-6 flex flex-col sm:flex-row sm:items-start gap-4">

                  <img
                    src={doc?.photo ||
                      `https://ui-avatars.com/api/?name=${doc?.name}&background=0ea5e9&color=fff`}
                    alt={doc?.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary-100"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      Dr. {doc?.name}
                    </h3>
                    <p className="text-sm text-primary-600">
                      {apt.doctorId?.specialization}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {apt.date} at {apt.time}
                    </p>
                    {apt.problem && (
                      <p className="text-sm text-gray-400 mt-1">
                        💬 {apt.problem}
                      </p>
                    )}

                    {apt.bookingNumber && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 space-y-1">
                        <p className="text-xs text-green-700 font-medium">
                          📋 Booking Ref:{' '}
                          <span className="font-bold tracking-wider">
                            {apt.bookingNumber}
                          </span>
                        </p>
                        {apt.otp && (
                          <p className="text-xs text-blue-700 font-medium">
                            🔐 OTP:{' '}
                            <span className="font-bold tracking-widest text-lg">
                              {new Date() < new Date(apt.otpExpiresAt)
                                ? apt.otp
                                : 'Expired'}
                            </span>
                            <span className="text-gray-400 ml-2 font-normal text-xs">
                              {new Date() < new Date(apt.otpExpiresAt)
                                ? `(Valid until ${new Date(apt.otpExpiresAt)
                                    .toLocaleTimeString('en-LK', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })})`
                                : '(OTP has expired)'}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {apt.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(apt._id)}
                          className="flex items-center gap-1 bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition">
                          <FaTimes size={12} />
                          Cancel
                        </button>
                      )}
                      {apt.status === 'completed' && (
                        <button
                          onClick={() => navigate('/patient/prescriptions')}
                          className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100 transition">
                          <FaFileMedical size={12} />
                          View Prescription
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;