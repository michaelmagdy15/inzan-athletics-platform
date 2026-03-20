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
    const [currentUser, setCurrentUser] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (profileError) throw profileError;

            if (data) {
                // Mapped member structure to match legacy DataContext
                const member: Member = {
                    id: data.id,
                    name: data.full_name,
                    email: data.email,
                    role: data.email === "michaelmitry13@gmail.com" ? "admin" : data.role,
                    avatar: data.avatar_url || `https://i.pravatar.cc/150?u=${data.id}`,
                    strain: data.current_strain || 0,
                    recovery: data.current_recovery || 0,
                    badges: data.athletic_passport_badges || [],
                    riskStatus: data.risk_status || "low",
                    code: data.member_code || "0000",
                    bookedClasses: [], // Will be filled by FitnessContext or a cross-fetch
                    membershipExpiry: data.membership_expiry,
                    membershipStatus: data.membership_status || "pending",
                    lastAttendance: data.last_attendance || null,
                    invitationsBalance: data.invitations_balance || 0,
                };
                setCurrentUser(member);
            }
        } catch (err: any) {
            console.error("Error fetching profile:", err);
            setError(err.message);
        }
    };

    const refreshUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await fetchProfile(session.user.id);
        } else {
            setCurrentUser(null);
        }
    };

    useEffect(() => {
        refreshUser().finally(() => setLoading(false));

        const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                await fetchProfile(session.user.id);
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => {
            authListener.unsubscribe();
        };
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
