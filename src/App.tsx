import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';
import MedicationTracker from './pages/MedicationTracker';
import Notifications from './pages/Notifications';
import AddMedication from './pages/AddMedication';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import DearOnesPortal from './pages/DearOnesPortal';
import Navbar from './components/Navbar';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="w-full">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Dear Ones Portal - accessible to both patients and dear ones */}
          <Route path="/dear-ones-portal" element={<DearOnesPortal />} />
          
          {/* Patient-only Routes */}
          <Route element={<ProtectedRoute patientOnly={true} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/medication-tracker" element={<MedicationTracker />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/add-medication" element={<AddMedication />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
