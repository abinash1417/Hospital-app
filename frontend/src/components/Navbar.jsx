import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHospital, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <FaHospital className="text-primary-600 text-2xl" />
            <span className="text-xl font-bold text-primary-700">
              MediCare
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/doctors"
              className="text-gray-600 hover:text-primary-600 font-medium transition">
              Find Doctors
            </Link>

            {user ? (
              <>
                {user.role === 'patient' && (
                  <Link to="/patient/dashboard"
                    className="text-gray-600 hover:text-primary-600 font-medium transition">
                    My Appointments
                  </Link>
                )}
                {user.role === 'doctor' && (
                  <Link to="/doctor/dashboard"
                    className="text-gray-600 hover:text-primary-600 font-medium transition">
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard"
                    className="text-gray-600 hover:text-primary-600 font-medium transition">
                    Admin Panel
                  </Link>
                )}
                <Link to="/chat"
                  className="text-gray-600 hover:text-primary-600 font-medium transition">
                  Messages
                </Link>
                <div className="flex items-center gap-3">
                  <img
                    src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=0ea5e9&color=fff`}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-primary-200"
                  />
                  <button
                    onClick={handleLogout}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"
                  className="text-primary-600 font-medium hover:text-primary-700 transition">
                  Login
                </Link>
                <Link to="/register"
                  className="bg-primary-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-700 transition">
                  Register
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-3">
            <Link to="/doctors" className="text-gray-600 font-medium py-2"
              onClick={() => setMenuOpen(false)}>
              Find Doctors
            </Link>
            {user ? (
              <>
                <Link to="/chat" className="text-gray-600 font-medium py-2"
                  onClick={() => setMenuOpen(false)}>
                  Messages
                </Link>
                <button onClick={handleLogout}
                  className="text-left text-red-600 font-medium py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 font-medium py-2"
                  onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="text-primary-600 font-medium py-2"
                  onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;