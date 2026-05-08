import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaComments, FaCheck, FaTimes, FaUserMd } from 'react-icons/fa';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700'
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aptRes, profileRes] = await Promise.all([
        API.get('/appointments/doctor'),
        API.get('/doctors/profile/me')
      ]);
      setAppointments(aptRes.data);
      setProfile(profileRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}/status`, { status });
      setAppointments(appointments.map(a =>
        a._id === id ? { ...a, status } : a
      ));
      toast.success(`Appointment ${status}!`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Dr. {user?.name} 👨‍⚕️
          </h1>
          <p className="text-gray-500 mt-1">
            {profile ? profile.specialization : 'Complete your profile'}
          </p>
        </div>
        <div className="flex gap-3">
  <button
    onClick={() => navigate('/doctor/edit-profile')}
    className="border border-primary-600 text-primary-600 px-4 py-2.5 rounded-xl font-medium hover:bg-primary-50 transition text-sm">
    ✏️ Edit Profile
  </button>
</div>
{!profile && (
  <button
    onClick={() => navigate('/doctor/complete-profile')}
    className="bg-amber-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-amber-600 transition">
    ⚠️ Complete Your Profile
  </button>
)}
        {profile?.isApproved === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-sm">
            ⏳ Waiting for admin approval
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', count: appointments.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Pending', count: appointments.filter(a => a.status === 'pending').length, color: 'bg-amber-50 text-amber-700' },
          { label: 'Confirmed', count: appointments.filter(a => a.status === 'confirmed').length, color: 'bg-green-50 text-green-700' },
          { label: 'Completed', count: appointments.filter(a => a.status === 'completed').length, color: 'bg-purple-50 text-purple-700' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-2xl p-4 text-center`}>
            <div className="text-2xl font-bold">{stat.count}</div>
            <div className="text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Appointments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <FaCalendarAlt className="text-primary-600" />
            Patient Appointments
          </h2>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-16">
            <FaUserMd className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No appointments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {appointments.map(apt => (
              <div key={apt._id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <img
                  src={apt.patientId?.photo || `https://ui-avatars.com/api/?name=${apt.patientId?.name}&background=6366f1&color=fff`}
                  alt={apt.patientId?.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {apt.patientId?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {apt.patientId?.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    📅 {apt.date} at {apt.time}
                  </p>
                  {apt.problem && (
                    <p className="text-sm text-gray-400 mt-1">
                      💬 {apt.problem}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                  <div className="flex gap-2">
                    {apt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatus(apt._id, 'confirmed')}
                          className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100 transition">
                          <FaCheck size={11} /> Accept
                        </button>
                        <button
                          onClick={() => handleStatus(apt._id, 'cancelled')}
                          className="flex items-center gap-1 bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition">
                          <FaTimes size={11} /> Reject
                        </button>
                      </>
                    )}
                    {apt.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => navigate(`/chat/${apt.patientId?._id}`)}
                          className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100 transition">
                          <FaComments size={11} /> Chat
                        </button>
                        <button
                          onClick={() => handleStatus(apt._id, 'completed')}
                          className="flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-100 transition">
                          <FaCheck size={11} /> Done
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;