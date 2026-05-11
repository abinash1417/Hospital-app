import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import {
  FaRobot, FaSearch, FaArrowLeft,
  FaExclamationTriangle, FaUserMd,
  FaCheckCircle, FaSpinner
} from 'react-icons/fa';

const urgencyColors = {
  Low: 'bg-green-50 border-green-200 text-green-700',
  Medium: 'bg-amber-50 border-amber-200 text-amber-700',
  High: 'bg-red-50 border-red-200 text-red-700'
};

const urgencyIcons = {
  Low: '🟢',
  Medium: '🟡',
  High: '🔴'
};

const SymptomChecker = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      toast.error('Please describe your symptoms');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await API.post('/ai/symptoms', { symptoms });
      setResult(data);
    } catch (err) {
      toast.error('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookDoctor = () => {
    if (result?.recommendedSpecialist) {
      navigate(`/doctors?specialization=${result.recommendedSpecialist}`);
    } else {
      navigate('/doctors');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="bg-white border border-gray-200 text-gray-600 p-2.5 rounded-xl hover:bg-gray-50 transition">
          <FaArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaRobot className="text-primary-600" />
            AI Symptom Checker
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Describe your symptoms and get doctor recommendations
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
        <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-amber-700 text-sm">
          This AI tool is for guidance only and does not replace professional
          medical advice. Always consult a qualified doctor for proper diagnosis.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <form onSubmit={handleCheck}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your symptoms in detail
          </label>
          <textarea
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder="Example: I have been experiencing chest pain and shortness of breath for the past 2 days. The pain gets worse when I exercise..."
            rows={5}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none text-sm"
          />

          <div className="flex flex-wrap gap-2 mt-3 mb-4">
            <p className="text-xs text-gray-400 w-full">Quick examples:</p>
            {[
              'Chest pain and shortness of breath',
              'Skin rash and itching',
              'Severe headache and dizziness',
              'Back pain and joint stiffness',
              'Stomach pain and nausea'
            ].map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSymptoms(example)}
                className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition border border-gray-100">
                {example}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <FaSpinner className="animate-spin" size={16} />
                Analyzing symptoms...
              </>
            ) : (
              <>
                <FaSearch size={16} />
                Check Symptoms
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-4">

          <div className={`rounded-2xl border p-5 ${urgencyColors[result.urgencyLevel] || urgencyColors.Medium}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {urgencyIcons[result.urgencyLevel] || '🟡'}
              </span>
              <div>
                <p className="font-bold text-lg">
                  {result.urgencyLevel} Priority
                </p>
                <p className="text-sm opacity-80">
                  {result.urgencyLevel === 'High'
                    ? 'Please seek medical attention as soon as possible'
                    : result.urgencyLevel === 'Medium'
                    ? 'Schedule an appointment within a few days'
                    : 'You can schedule a routine appointment'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FaUserMd className="text-primary-600" />
              Recommended Specialist
            </h3>
            <div className="bg-primary-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-primary-700 text-lg">
                  {result.recommendedSpecialist}
                </p>
                <p className="text-primary-600 text-sm mt-1">
                  Best match for your symptoms
                </p>
              </div>
              <button
                onClick={handleBookDoctor}
                className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition text-sm">
                Book Now
              </button>
            </div>
          </div>

          {result.possibleConditions?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-3">
                Possible Conditions
              </h3>
              <div className="space-y-2">
                {result.possibleConditions.map((condition, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <FaCheckCircle className="text-primary-400" size={14} />
                    <span className="text-gray-700 text-sm">{condition}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                These are possibilities only, not a diagnosis.
              </p>
            </div>
          )}

          {result.advice && (
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <h3 className="font-bold text-blue-800 mb-2">
                Medical Advice
              </h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                {result.advice}
              </p>
            </div>
          )}

          {result.warning && (
            <div className="bg-red-50 rounded-2xl border border-red-100 p-5 flex gap-3">
              <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm leading-relaxed">
                {result.warning}
              </p>
            </div>
          )}

          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white text-center">
            <h3 className="font-bold text-lg mb-2">
              Ready to see a doctor?
            </h3>
            <p className="text-primary-100 text-sm mb-4">
              Book an appointment with a {result.recommendedSpecialist} at
              MediCare Hospital
            </p>
            <button
              onClick={handleBookDoctor}
              className="bg-white text-primary-600 px-8 py-2.5 rounded-xl font-semibold hover:bg-primary-50 transition">
              Book Appointment Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;