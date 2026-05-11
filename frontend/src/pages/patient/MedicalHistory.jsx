import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import {
  FaArrowLeft, FaUserMd, FaCalendarAlt,
  FaFileMedical, FaChartBar, FaHistory
} from 'react-icons/fa';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700'
};

const MedicalHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await API.get('/medical-history/my');
        setData(data);
      } catch (err) {
        toast.error('Failed to load medical history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <Spinner />;

  const tabs = ['overview', 'appointments', 'prescriptions', 'doctors'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="bg-white border border-gray-200 text-gray-600 p-2.5 rounded-xl hover:bg-gray-50 transition">
          <FaArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaHistory className="text-primary-600" />
            Medical History
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Complete health record for {user?.name}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 font-medium text-sm capitalize transition border-b-2 -mb-px whitespace-nowrap ${
              tab === t
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && data && (
        <div className="space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                label: 'Total Visits',
                value: data.stats.totalAppointments,
                icon: <FaCalendarAlt />,
                color: 'bg-blue-50 text-blue-600'
              },
              {
                label: 'Completed',
                value: data.stats.completedAppointments,
                icon: <FaCalendarAlt />,
                color: 'bg-green-50 text-green-600'
              },
              {
                label: 'Cancelled',
                value: data.stats.cancelledAppointments,
                icon: <FaCalendarAlt />,
                color: 'bg-red-50 text-red-600'
              },
              {
                label: 'Prescriptions',
                value: data.stats.totalPrescriptions,
                icon: <FaFileMedical />,
                color: 'bg-purple-50 text-purple-600'
              },
              {
                label: 'Doctors Visited',
                value: data.stats.doctorsVisited,
                icon: <FaUserMd />,
                color: 'bg-amber-50 text-amber-600'
              },
            ].map((stat, i) => (
              <div key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Recent Appointments</h3>
              <button
                onClick={() => setTab('appointments')}
                className="text-primary-600 text-sm hover:underline">
                View all
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {data.appointments.slice(0, 3).map(apt => (
                <div key={apt._id} className="p-4 flex items-center gap-4">
                  <img
                    src={apt.doctorId?.userId?.photo ||
                      `https://ui-avatars.com/api/?name=${apt.doctorId?.userId?.name}&background=0ea5e9&color=fff`}
                    alt={apt.doctorId?.userId?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">
                      Dr. {apt.doctorId?.userId?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {apt.date} at {apt.time}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
              {data.appointments.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No appointments yet
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Recent Prescriptions</h3>
              <button
                onClick={() => setTab('prescriptions')}
                className="text-primary-600 text-sm hover:underline">
                View all
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {data.prescriptions.slice(0, 3).map(pres => (
                <div key={pres._id} className="p-4 flex items-center gap-4">
                  <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
                    <FaFileMedical className="text-primary-600" size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">
                      Dr. {pres.doctorId?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {pres.diagnosis?.substring(0, 50)}
                      {pres.diagnosis?.length > 50 ? '...' : ''}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(pres.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
              ))}
              {data.prescriptions.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No prescriptions yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'appointments' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">
              All Appointments ({data.appointments.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {data.appointments.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No appointments found
              </div>
            ) : (
              data.appointments.map(apt => (
                <div key={apt._id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <img
                    src={apt.doctorId?.userId?.photo ||
                      `https://ui-avatars.com/api/?name=${apt.doctorId?.userId?.name}&background=0ea5e9&color=fff`}
                    alt={apt.doctorId?.userId?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      Dr. {apt.doctorId?.userId?.name}
                    </p>
                    <p className="text-sm text-primary-600">
                      {apt.doctorId?.specialization}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {apt.date} at {apt.time}
                    </p>
                    {apt.problem && (
                      <p className="text-xs text-gray-400 mt-1">
                        💬 {apt.problem}
                      </p>
                    )}
                    {apt.bookingNumber && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        📋 Ref: {apt.bookingNumber}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium self-start ${statusColors[apt.status]}`}>
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'prescriptions' && (
        <div className="space-y-4">
          {data.prescriptions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-12 text-gray-400">
              No prescriptions found
            </div>
          ) : (
            data.prescriptions.map(pres => (
              <div key={pres._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
                      <FaFileMedical className="text-primary-600" size={14} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Dr. {pres.doctorId?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(pres.createdAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/patient/prescriptions')}
                    className="text-primary-600 text-xs font-medium hover:underline">
                    View & Download
                  </button>
                </div>

                <div className="bg-blue-50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    DIAGNOSIS
                  </p>
                  <p className="text-gray-800 text-sm">{pres.diagnosis}</p>
                </div>

                <div className="space-y-1">
                  {pres.medicines.map((med, i) => (
                    <div key={i}
                      className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                      <span className="font-medium">{med.name}</span>
                      <span className="text-gray-400">
                        — {med.dosage}, {med.frequency}
                      </span>
                    </div>
                  ))}
                </div>

                {pres.followUpDate && (
                  <div className="mt-3 bg-green-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-green-600 font-medium">
                      Follow-up: {pres.followUpDate}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'doctors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.doctorsVisited.length === 0 ? (
            <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-12 text-gray-400">
              No doctors visited yet
            </div>
          ) : (
            data.doctorsVisited.map(doctor => (
              <div key={doctor._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center hover:shadow-md transition">
                <img
                  src={doctor.userId?.photo ||
                    `https://ui-avatars.com/api/?name=${doctor.userId?.name}&background=0ea5e9&color=fff&size=128`}
                  alt={doctor.userId?.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-primary-50 mx-auto mb-3"
                />
                <h3 className="font-bold text-gray-800">
                  Dr. {doctor.userId?.name}
                </h3>
                <p className="text-primary-600 text-sm mt-1">
                  {doctor.specialization}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {doctor.experience} years experience
                </p>
                <p className="text-green-600 text-xs font-medium mt-1">
                  Rs. {doctor.fees?.toLocaleString('en-LK')} LKR
                </p>
                <button
                  onClick={() => navigate(`/doctors/${doctor._id}`)}
                  className="mt-3 w-full bg-primary-50 text-primary-600 py-2 rounded-xl text-sm font-medium hover:bg-primary-100 transition">
                  Book Again
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;