import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const DoctorCard = ({ doctor }) => {
  const user = doctor.userId;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isAvailableToday = doctor.availableSlots?.some(
    slot => slot.day === today
  );
  const todaySlot = doctor.availableSlots?.find(slot => slot.day === today);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 flex flex-col items-center">
        <img
          src={user?.photo || `https://ui-avatars.com/api/?name=${user?.name}&background=0ea5e9&color=fff&size=128`}
          alt={user?.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
        />
        <h3 className="mt-3 font-bold text-gray-800 text-lg">
          Dr. {user?.name}
        </h3>
        <span className="text-primary-600 font-medium text-sm mt-1">
          {doctor.specialization}
        </span>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1 text-amber-500">
            <FaStar size={14} />
            <span className="text-sm font-medium text-gray-600">
              {doctor.experience} yrs exp
            </span>
          </div>
          <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
            Rs. {doctor.fees?.toLocaleString('en-LK')}
          </div>
        </div>

        {/* Availability */}
        {isAvailableToday ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-xs text-green-600 font-medium">
              Available today: {todaySlot.startTime} - {todaySlot.endTime}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <span className="text-xs text-gray-400">
              Not available today
            </span>
          </div>
        )}

        <Link
          to={`/doctors/${doctor._id}`}
          className="block w-full text-center bg-primary-600 text-white py-2.5 rounded-xl font-medium hover:bg-primary-700 transition group-hover:shadow-md">
          View Profile & Book
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;