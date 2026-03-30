import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/firebase";
import { Member } from "../types";

interface AuthContextType {
    currentUser: Member | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, data: any) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const mockAdmin: Member = {
        id: "mock-admin-id",
        name: "Mock Admin Bypass",
        email: "michaelmitry13@gmail.com",
        role: "admin",
        avatar: "https://i.pravatar.cc/150",
        strain: 0,
        recovery: 0,
        badges: [],
        riskStatus: "low",
        code: "0000",
        bookedClasses: [],
        membershipExpiry: "2099-12-31",
        membershipStatus: "active",
        lastAttendance: null,
        invitationsBalance: 0,
    };

    const [currentUser, setCurrentUser] = useState<Member | null>(mockAdmin);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async (userId: string) => {
        // Disabled for bypass
    };

    const refreshUser = async () => {
        // Disabled for bypass
    };

    useEffect(() => {
        // Disabled Supabase Auth Listener for bypass
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
    };

    const signUp = async (email: string, password: string, data: any) => {
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data }
        });
        if (signUpError) throw signUpError;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const resetPassword = async (email: string) => {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        if (resetError) throw resetError;
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            loading,
            error,
            signIn,
            signUp,
            signOut,
            resetPassword,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
