import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserApp from "./pages/UserApp";
import AdminHub from "./pages/AdminHub";
import CoachApp from "./pages/CoachApp";
import NutritionistApp from "./pages/NutritionistApp";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UserSubPage from "./pages/UserSubPage";
import PaymentResult from "./pages/PaymentResult";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import { useData } from "./context/DataContext";
import { Loader2 } from "lucide-react";

import ProtectedRoute from "./components/shared/ProtectedRoute";
import HolidayDecorations from "./components/common/HolidayDecorations";

import KDSApp from "./pages/KDSApp";

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
      <HolidayDecorations />
      <Routes>
        <Route
          path="/auth"
          element={!currentUser ? <AuthPage /> : <Navigate to="/" />}
        />

        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Member & Global Landing */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {currentUser?.membershipStatus === "pending" ? (
                <PendingApprovalPage />
              ) : currentUser?.role === "admin" ? (
                <Navigate to="/admin" />
              ) : currentUser?.role === "coach" ? (
                <CoachApp />
              ) : currentUser?.role === "nutritionist" ? (
                <NutritionistApp />
              ) : (
                <UserApp />
              )}
            </ProtectedRoute>
          }
        />

        {/* KDS (Kitchen Tablet Mode) */}
        <Route
          path="/kds"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KDSApp />
            </ProtectedRoute>
          }
        />

        {/* Member Protected SubPages */}
        <Route
          path="/p/:pageId"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <UserSubPage />
            </ProtectedRoute>
          }
        />

        {/* Payment Webhook Redirects */}
        <Route
          path="/payment/:status"
          element={
            <ProtectedRoute>
              <PaymentResult />
            </ProtectedRoute>
          }
        />

        {/* Admin Preview Routes */}
        <Route
          path="/preview-member"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preview-coach"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CoachApp />
            </ProtectedRoute>
          }
        />

        {/* Strictly Admin Protected Area */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminHub />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
