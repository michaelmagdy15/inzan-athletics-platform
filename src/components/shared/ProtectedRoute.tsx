import React from "react";
import { Navigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ("member" | "coach" | "admin")[];
}

export default function ProtectedRoute({
    children,
    allowedRoles,
}: ProtectedRouteProps) {
    const { currentUser, loading } = useData();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#FFB800] animate-spin" />
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/auth" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role as any)) {
        // If they aren't allowed, kick them to the base root to let App.tsx re-route them 
        // to their proper home (e.g. member goes to /, admin to /admin)
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
