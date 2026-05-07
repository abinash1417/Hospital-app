import { useState, useEffect } from 'react';
import API from '../utils/api';
import DoctorCard from '../components/DoctorCard';
import Spinner from '../components/Spinner';
import { FaSearch } from 'react-icons/fa';

const specializations = [
  'All', 'Cardiologist', 'Dermatologist', 'Neurologist',
  'Orthopedic', 'Pediatrician', 'Psychiatrist', 'Dentist', 'General Physician'
];

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('All');

  useEffect(() => {
    fetchDoctors();
  }, [selected]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selected !== 'All') params.specialization = selected;
      if (search) params.search = search;
      const { data } = await API.get('/doctors', { params });
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Find a Doctor</h1>
      <p className="text-gray-500 mb-8">
        Search from our network of verified doctors
      </p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by doctor name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          />
        </div>
        <button type="submit"
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition">
          Search
        </button>
      </form>

      <div className="flex gap-2 flex-wrap mb-8">
        {specializations.map(spec => (
          <button
            key={spec}
            onClick={() => setSelected(spec)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selected === spec
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-400'
            }`}>
            {spec}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          <p className="text-gray-500 mb-6">{doctors.length} doctors found</p>
          {doctors.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No doctors found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try a different search or specialization
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {doctors.map(doctor => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Doctors;