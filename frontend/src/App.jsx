import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import DoctorProfile from './pages/DoctorProfile';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Chat from './pages/Chat';
import CompleteProfile from './pages/doctor/CompleteProfile';
import EditProfile from './pages/doctor/EditProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


// Protected Route
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorProfile />} />
        <Route path="/patient/dashboard" element={
          <ProtectedRoute roles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/doctor/complete-profile" element={
  <ProtectedRoute roles={['doctor']}>
    <CompleteProfile />
  </ProtectedRoute>
} />
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute roles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
  <ProtectedRoute roles={['patient', 'doctor', 'admin']}>
    <Chat />
  </ProtectedRoute>
} />
<Route path="/chat/:userId" element={
  <ProtectedRoute roles={['patient', 'doctor', 'admin']}>
    <Chat />
  </ProtectedRoute>
} />
        <Route path="/doctor/edit-profile" element={
  <ProtectedRoute roles={['doctor']}>
    <EditProfile />
  </ProtectedRoute>
} />

<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
<Route path="/doctor/edit-profile" element={
  <ProtectedRoute roles={['doctor']}>
    <EditProfile />
  </ProtectedRoute>
} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;