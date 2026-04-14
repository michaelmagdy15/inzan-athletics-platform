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
    updateMembership: (tier: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapProfileToMember(p: any): Member {
    return {
        id: p.id,
        name: p.full_name || p.name || "Unknown User",
        email: p.email,
        role: p.role || "member",
        avatar: p.avatar_url || `https://i.pravatar.cc/150?u=${p.id}`,
        strain: p.current_strain || 0,
        recovery: p.current_recovery || 0,
        badges: p.athletic_passport_badges || [],
        riskStatus: p.risk_status || "low",
        code: p.member_code || "0000",
        bookedClasses: [],
        membershipExpiry: p.membership_expiry || "2099-12-31",
        membershipStatus: p.membership_status || "pending",
        lastAttendance: p.last_attendance || null,
        invitationsBalance: p.invitations_balance || 0,
        membershipTier: p.membership_tier || "Standard",
        full_name: p.full_name || p.name || "Unknown User",
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfileWithRetry = async (email: string, retries = 3, delay = 1500): Promise<Member> => {
        try {
            const { data: profile, error: fetchError } = await supabase
                .from("profiles")
                .select("*")
                .eq("email", email)
                .single();

            if (fetchError || !profile) {
                if (retries > 0) {
                    console.warn(`Profile Not Found. Retrying in ${delay}ms... (${retries} retries left)`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return fetchProfileWithRetry(email, retries - 1, delay);
                }
                throw new Error("Profile synchronization failed. Please contact support.");
            }
            
            const member = mapProfileToMember(profile);
            
            // Force super_admin for owner email
            if (member.email === "michaelmitry13@gmail.com") {
                member.role = "super_admin";
            }
            
            return member;
        } catch (err) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchProfileWithRetry(email, retries - 1, delay);
            }
            throw err;
        }
    };

    // Firebase Auth State Listener
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
            if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
                try {
                    const user = await fetchProfileWithRetry(session.email);
                    setCurrentUser(user);
                } catch (err) {
                    console.error("Auth listener profile fetch error:", err);
                    setCurrentUser(null);
                }
            } else if (event === "SIGNED_OUT") {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshUser = async () => {
        if (!currentUser) return;
        try {
            const user = await fetchProfileWithRetry(currentUser.email);
            setCurrentUser(user);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const signIn = async (email: string, password: string) => {
        setError(null);
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        // Listener will handle setting current user
    };

    const signUp = async (email: string, password: string, data: any) => {
        setError(null);
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data }
        });
        if (signUpError) throw signUpError;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

    const resetPassword = async (email: string) => {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        if (resetError) throw resetError;
    };

    const updateMembership = async (tier: string) => {
        if (!currentUser) return;
        
        try {
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ 
                    membership_tier: tier,
                    membership_status: "active",
                    updated_at: new Date().toISOString()
                })
                .eq("id", currentUser.id);

            if (updateError) throw updateError;
            await refreshUser();
        } catch (err: any) {
            console.error("Membership update error:", err);
            throw err;
        }
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
            refreshUser,
            updateMembership
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
