import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// auth pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// pages
import LandingPage from "./pages/LandingPage";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Konsultasi from "./pages/Konsultasi";
import Pesanan from "./pages/Pesanan";
import Produk from "./pages/Produk";
import Users from "./pages/Users";

const App = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout(); // ini akan otomatis menghapus token dan user di context
  };

  return (
    <Router>
      <div className="flex">
        {/* Sidebar hanya muncul jika login */}
        {isAuthenticated && <Sidebar user={user} onLogout={handleLogout} />}

        <main className={`${isAuthenticated ? "ml-64" : ""} w-full bg-slate-100 min-h-screen`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/konsultasi"
              element={
                <ProtectedRoute>
                  <Konsultasi />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pesanan"
              element={
                <ProtectedRoute>
                  <Pesanan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produk"
              element={
                <ProtectedRoute>
                  <Produk />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
