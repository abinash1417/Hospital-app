import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import {
  FaUserMd, FaUsers, FaCalendarAlt, FaClock,
  FaCheck, FaTimes, FaTrash, FaComments
} from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, doctorsRes, patientsRes, aptsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/doctors'),
        API.get('/admin/patients'),
        API.get('/admin/appointments')
      ]);
      setStats(statsRes.data);
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
      setAppointments(aptsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorApproval = async (id, status) => {
    try {
      await API.put(`/admin/doctors/${id}/approval`, { status });
      setDoctors(doctors.map(d =>
        d._id === id ? { ...d, isApproved: status } : d
      ));
      toast.success(`Doctor ${status}!`);
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Delete this doctor? This cannot be undone.')) return;
    try {
      await API.delete(`/admin/doctors/${id}`);
      setDoctors(doctors.filter(d => d._id !== id));
      toast.success('Doctor deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Delete this patient? This cannot be undone.')) return;
    try {
      await API.delete(`/admin/patients/${id}`);
      setPatients(patients.filter(p => p._id !== id));
      toast.success('Patient deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <Spinner />;

  const tabs = ['overview', 'doctors', 'patients', 'appointments', 'messages'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Admin Dashboard 🛡️
          </h1>
          <p className="text-gray-500 mt-1">
            MediCare Hospital Management System
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => {
              if (t === 'messages') {
                navigate('/chat');
              } else {
                setTab(t);
              }
            }}
            className={`px-5 py-2.5 font-medium text-sm capitalize transition border-b-2 -mb-px whitespace-nowrap ${
              tab === t
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'messages' ? '💬 Messages' : t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                label: 'Total Doctors',
                value: stats.totalDoctors,
                icon: <FaUserMd />,
                color: 'bg-blue-50 text-blue-600'
              },
              {
                label: 'Total Patients',
                value: stats.totalPatients,
                icon: <FaUsers />,
                color: 'bg-green-50 text-green-600'
              },
              {
                label: 'Total Appointments',
                value: stats.totalAppointments,
                icon: <FaCalendarAlt />,
                color: 'bg-purple-50 text-purple-600'
              },
              {
                label: "Today's Appointments",
                value: stats.todayAppointments,
                icon: <FaClock />,
                color: 'bg-amber-50 text-amber-600'
              },
              {
                label: 'Pending Approvals',
                value: stats.pendingDoctors,
                icon: <FaClock />,
                color: 'bg-red-50 text-red-600'
              },
            ].map((stat, i) => (
              <div key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setTab('doctors')}
              className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:shadow-md transition">
              <FaUserMd className="text-primary-600 text-2xl mb-3" />
              <h3 className="font-semibold text-gray-800">Manage Doctors</h3>
              <p className="text-sm text-gray-500 mt-1">
                Approve, reject or remove doctors
              </p>
            </button>
            <button
              onClick={() => setTab('patients')}
              className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:shadow-md transition">
              <FaUsers className="text-green-500 text-2xl mb-3" />
              <h3 className="font-semibold text-gray-800">Manage Patients</h3>
              <p className="text-sm text-gray-500 mt-1">
                View and manage patient accounts
              </p>
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:shadow-md transition">
              <FaComments className="text-purple-500 text-2xl mb-3" />
              <h3 className="font-semibold text-gray-800">Messages</h3>
              <p className="text-sm text-gray-500 mt-1">
                Chat with doctors and patients
              </p>
            </button>
          </div>

          {/* Pending doctor approvals alert */}
          {stats.pendingDoctors > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-amber-800">
                    {stats.pendingDoctors} doctor(s) waiting for approval
                  </p>
                  <p className="text-sm text-amber-600">
                    Review and approve new doctor registrations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTab('doctors')}
                className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition">
                Review Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Doctors Tab */}
      {tab === 'doctors' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">
              All Doctors ({doctors.length})
            </h2>
            <div className="flex gap-2 text-xs">
              <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                Pending: {doctors.filter(d => d.isApproved === 'pending').length}
              </span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Approved: {doctors.filter(d => d.isApproved === 'approved').length}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {doctors.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                No doctors registered yet
              </div>
            ) : (
              doctors.map(doctor => (
                <div key={doctor._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <img
                    src={doctor.userId?.photo || `https://ui-avatars.com/api/?name=${doctor.userId?.name}&background=0ea5e9&color=fff`}
                    alt={doctor.userId?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      Dr. {doctor.userId?.name}
                    </h3>
                    <p className="text-sm text-primary-600">
                      {doctor.specialization}
                    </p>
                    <p className="text-sm text-gray-500">
                      {doctor.userId?.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Rs. {doctor.fees?.toLocaleString('en-LK')} LKR •{' '}
                      {doctor.experience} yrs exp
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doctor.isApproved === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : doctor.isApproved === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {doctor.isApproved}
                    </span>
                    {doctor.isApproved === 'pending' && (
                      <>
                        <button
                          onClick={() => handleDoctorApproval(doctor._id, 'approved')}
                          title="Approve"
                          className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition">
                          <FaCheck size={13} />
                        </button>
                        <button
                          onClick={() => handleDoctorApproval(doctor._id, 'rejected')}
                          title="Reject"
                          className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition">
                          <FaTimes size={13} />
                        </button>
                      </>
                    )}
                    {doctor.isApproved === 'rejected' && (
                      <button
                        onClick={() => handleDoctorApproval(doctor._id, 'approved')}
                        title="Approve"
                        className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition">
                        <FaCheck size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/chat/${doctor.userId?._id}`)}
                      title="Chat with doctor"
                      className="bg-blue-50 text-blue-500 p-2 rounded-lg hover:bg-blue-100 transition">
                      <FaComments size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor._id)}
                      title="Delete doctor"
                      className="bg-gray-50 text-gray-500 p-2 rounded-lg hover:bg-gray-100 transition">
                      <FaTrash size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {tab === 'patients' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">
              All Patients ({patients.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {patients.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                No patients registered yet
              </div>
            ) : (
              patients.map(patient => (
                <div key={patient._id}
                  className="p-5 flex items-center gap-4">
                  <img
                    src={patient.photo || `https://ui-avatars.com/api/?name=${patient.name}&background=6366f1&color=fff`}
                    alt={patient.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-gray-500">{patient.email}</p>
                    <p className="text-sm text-gray-400">{patient.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/chat/${patient._id}`)}
                      title="Chat with patient"
                      className="bg-blue-50 text-blue-500 p-2 rounded-lg hover:bg-blue-100 transition">
                      <FaComments size={13} />
                    </button>
                    <button
                      onClick={() => handleDeletePatient(patient._id)}
                      title="Delete patient"
                      className="bg-gray-50 text-gray-500 p-2 rounded-lg hover:bg-gray-100 transition">
                      <FaTrash size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'appointments' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">
              All Appointments ({appointments.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {appointments.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                No appointments yet
              </div>
            ) : (
              appointments.map(apt => (
                <div key={apt._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex gap-2 flex-wrap items-center">
                      <span className="font-medium text-gray-800">
                        {apt.patientId?.name}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium text-primary-600">
                        Dr. {apt.doctorId?.userId?.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({apt.doctorId?.specialization})
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {apt.date} at {apt.time}
                    </p>
                    {apt.problem && (
                      <p className="text-sm text-gray-400 mt-0.5">
                        💬 {apt.problem}
                      </p>
                    )}
                    {apt.bookingNumber && (
                      <p className="text-xs text-green-600 mt-0.5 font-medium">
                        📋 Ref: {apt.bookingNumber}
                      </p>
                    )}
                    {apt.fees && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        💳 Rs. {apt.fees?.toLocaleString('en-LK')} LKR
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium self-start sm:self-center ${
                    apt.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : apt.status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : apt.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;