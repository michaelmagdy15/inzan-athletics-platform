import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserApp from './pages/UserApp';
import AdminHub from './pages/AdminHub';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UserSubPage from './pages/UserSubPage';
import { useData } from './context/DataContext';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { currentUser, loading } = useData();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FFB800] animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={!currentUser ? <AuthPage /> : <Navigate to="/" />}
        />

        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

        <Route
          path="/"
          element={currentUser ? <UserApp /> : <Navigate to="/auth" />}
        />

        <Route
          path="/p/:pageId"
          element={currentUser ? <UserSubPage /> : <Navigate to="/auth" />}
        />

        <Route
          path="/admin"
          element={
            currentUser?.role === 'admin'
              ? <AdminHub />
              : <Navigate to={currentUser ? "/" : "/auth"} />
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

