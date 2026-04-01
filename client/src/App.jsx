import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Breathing from './pages/Breathing';
import Premium from './pages/Premium';
import Navbar from './components/Navbar';
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-8 space-y-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="h-12 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  const location = useLocation();

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-300">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Private Routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Navbar />
                  <main className="container mx-auto px-4 py-8">
                    <AnimatePresence mode="wait">
                      <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/journal" element={<Journal />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/breathe" element={<Breathing />} />
                        <Route path="/premium" element={<Premium />} />
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </AnimatePresence>
                  </main>
                </ProtectedRoute>
              } />
            </Routes>
          </AnimatePresence>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
