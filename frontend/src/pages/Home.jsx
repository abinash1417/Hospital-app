import { Link } from 'react-router-dom';
import {
  FaUserMd, FaCalendarCheck, FaComments, FaShieldAlt,
  FaHospital, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock
} from 'react-icons/fa';

const Home = () => {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Your Health, <br />
              <span className="text-primary-200">Our Priority</span>
            </h1>
            <p className="text-primary-100 text-lg mb-8 leading-relaxed">
              Book appointments with top doctors, chat with our support team,
              and manage your health all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/doctors"
                className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 transition shadow-lg">
                Find a Doctor
              </Link>
              <Link to="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 transition">
                Get Started
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg"
              alt="Doctor"
              className="w-80 rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '50+', label: 'Doctors' },
            { value: '5k+', label: 'Patients' },
            { value: '20+', label: 'Specializations' },
            { value: '98%', label: 'Satisfaction' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
              <div className="text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Why Choose MediCare?
        </h2>
        <p className="text-center text-gray-500 mb-12">
          Everything you need for better healthcare
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <FaUserMd className="text-primary-600 text-3xl" />,
              title: 'Expert Doctors',
              desc: 'Connect with verified and experienced doctors across all specializations.'
            },
            {
              icon: <FaCalendarCheck className="text-green-500 text-3xl" />,
              title: 'Easy Booking',
              desc: 'Book appointments in seconds and get instant confirmation with booking number.'
            },
            {
              icon: <FaComments className="text-purple-500 text-3xl" />,
              title: 'Admin Support Chat',
              desc: 'Chat directly with our hospital admin team for any queries or assistance.'
            },
            {
              icon: <FaShieldAlt className="text-amber-500 text-3xl" />,
              title: 'Secure & Private',
              desc: 'Your health data is encrypted and completely secure.'
            },
          ].map((feature, i) => (
            <div key={i}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-primary-100 mb-8">
            Join thousands of patients who trust MediCare for their healthcare needs.
          </p>
          <Link to="/register"
            className="bg-white text-primary-600 px-10 py-3 rounded-xl font-semibold hover:bg-primary-50 transition shadow-lg inline-block">
            Create Free Account
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <FaHospital className="text-primary-400 text-2xl" />
                <span className="text-white text-xl font-bold">MediCare</span>
              </div>
              <p className="text-sm leading-relaxed">
                Providing quality healthcare services to the people of
                Sri Lanka with compassion and excellence.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="hover:text-primary-400 transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/doctors" className="hover:text-primary-400 transition">
                    Find Doctors
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-primary-400 transition">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-primary-400 transition">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Our Services</h4>
              <ul className="space-y-2 text-sm">
                <li>Cardiology</li>
                <li>Dermatology</li>
                <li>Neurology</li>
                <li>Pediatrics</li>
                <li>Orthopedics</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <FaMapMarkerAlt className="text-primary-400 mt-0.5 flex-shrink-0" />
                  <span>No. 45, Palaali Road, Jaffna, Sri Lanka</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaPhone className="text-primary-400 flex-shrink-0" />
                  <span>+94 11 234 5678</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaEnvelope className="text-primary-400 flex-shrink-0" />
                  <span>info@medicare.lk</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaClock className="text-primary-400 flex-shrink-0" />
                  <span>Open 24/7 — Emergency Services</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-sm">
              © {new Date().getFullYear()} MediCare Hospital (Pvt) Ltd.
              All rights reserved.
            </p>
            <p className="text-sm">
              Registered under the Ministry of Health, Sri Lanka |
              Reg No: MOH/2024/0123
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;