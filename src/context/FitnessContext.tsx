import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/firebase";
import {
    Member, ClassSession, PTPackage, PTSession,
    CoachAvailability, SessionPolicy, AttendanceLog,
    FreezeRequest, WaitlistEntry, SessionType, SessionStatus
} from "../types";
import { useAuth } from "./AuthContext";
import * as Notifications from "../lib/NotificationService";

interface FitnessContextType {
    members: Member[];
    classes: ClassSession[];
    ptPackages: PTPackage[];
    ptSessions: PTSession[];
    coachAvailabilities: CoachAvailability[];
    sessionPolicies: SessionPolicy[];
    attendanceLogs: AttendanceLog[];
    freezeRequests: FreezeRequest[];
    classWaitlists: WaitlistEntry[];
    loading: boolean;
    bookClass: (classId: string) => Promise<void>;
    cancelClass: (classId: string) => Promise<void>;
    bookPTSession: (data: any) => Promise<void>;
    bookTrialSession: (data: { coach_id: string; member_id: string; scheduled_date: string; scheduled_time: string }) => Promise<void>;
    cancelPTSession: (sessionId: string) => Promise<void>;
    submitFreezeRequest: (startDate: string, endDate: string, reason: string) => Promise<void>;
    addMember: (data: { name: string; email: string }) => Promise<void>;
    deleteMember: (memberId: string) => Promise<void>;
    updateMemberStatus: (memberId: string, status: Member["membershipStatus"]) => Promise<void>;
    updateMemberRole: (memberId: string, role: Member["role"]) => Promise<void>;
    renewMembership: (memberId: string) => Promise<void>;
    addCoach: (data: { name: string; email: string }) => Promise<void>;
    addClass: (data: any) => Promise<void>;
    assignMembership: (memberId: string, tierId: string) => Promise<void>;
    registerAttendance: (code: string) => Promise<void>;
    reviewFreezeRequest: (requestId: string, status: "approved" | "rejected") => Promise<void>;
    refreshFitness: () => Promise<void>;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export function FitnessProvider({ children }: { children: React.ReactNode }) {
    const { currentUser } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [ptPackages, setPtPackages] = useState<PTPackage[]>([]);
    const [ptSessions, setPtSessions] = useState<PTSession[]>([]);
    const [coachAvailabilities, setCoachAvailabilities] = useState<CoachAvailability[]>([]);
    const [sessionPolicies, setSessionPolicies] = useState<SessionPolicy[]>([]);
    const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
    const [freezeRequests, setFreezeRequests] = useState<FreezeRequest[]>([]);
    const [classWaitlists, setClassWaitlists] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshFitness = async () => {
        try {
            const { data: profilesData } = await supabase.from("profiles").select("*");
            const { data: classesData } = await supabase.from("classes").select("*, coach:coaches(profiles(full_name))");
            const { data: packagesData } = await supabase.from("pt_packages").select("*");
            const { data: sessionsData } = await supabase.from("pt_sessions").select("*");
            const { data: availabilityData } = await supabase.from("coach_availabilities").select("*");
            const { data: policiesData } = await supabase.from("session_policies").select("*");
            const { data: attendanceData } = await supabase.from("attendance_logs").select("*").limit(500);
            const { data: freezeData } = await supabase.from("freeze_requests").select("*");
            const { data: waitlistsData } = await supabase.from("class_waitlists").select("*");
            const { data: bookingsData } = await supabase.from("bookings").select("*");

            const mappedMembers = profilesData?.map(p => ({
                id: p.id,
                name: p.full_name,
                email: p.email,
                role: p.role,
                avatar: p.avatar_url || `https://i.pravatar.cc/150?u=${p.id}`,
                strain: p.current_strain || 0,
                recovery: p.current_recovery || 0,
                badges: p.athletic_passport_badges || [],
                riskStatus: p.risk_status || "low",
                code: p.member_code || "0000",
                bookedClasses: bookingsData?.filter(b => b.member_id === p.id).map(b => b.class_id) || [],
                membershipExpiry: p.membership_expiry,
                membershipStatus: p.membership_status || "pending",
                lastAttendance: p.last_attendance || null,
                invitationsBalance: p.invitations_balance || 0,
            })) || [];
            setMembers(mappedMembers);

            setClasses(classesData?.map(c => ({
                id: c.id,
                title: c.name,
                trainer: c.coach?.profiles?.full_name || "Coach",
                time: new Date(c.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                duration: `${c.duration_minutes} Mins`,
                spots_left: c.capacity - (bookingsData?.filter(b => b.class_id === c.id).length || 0),
                total_spots: c.capacity,
                date: new Date(c.start_time).toLocaleDateString(),
                watermark: c.tags?.[0]?.toUpperCase() || "GENERAL",
                image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?fit=crop&w=800",
                tags: c.tags || [],
            })) || []);

            const memberLookup = new Map(mappedMembers.map(m => [m.id, m.name]));
            setPtPackages((packagesData || []).map(p => ({
                ...p,
                price_paid: Number(p.price_paid),
                member_name: memberLookup.get(p.member_id) || "Unknown",
                coach_name: memberLookup.get(p.coach_id) || "Any Coach",
            })));

            setPtSessions((sessionsData || []).map(s => ({
                ...s,
                member_name: memberLookup.get(s.member_id) || "Unknown",
                coach_name: memberLookup.get(s.coach_id) || "Unknown",
            })));

            setCoachAvailabilities(availabilityData || []);
            setSessionPolicies(policiesData || []);
            setAttendanceLogs(attendanceData || []);
            setFreezeRequests((freezeData || []).map(fr => ({
                ...fr,
                member_name: memberLookup.get(fr.member_id) || "Unknown",
            })));
            setClassWaitlists(waitlistsData || []);

        } catch (err) {
            console.error("Error refreshing fitness data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshFitness();
    }, []);

    const bookClass = async (classId: string) => {
        if (!currentUser) throw new Error("Authentication required.");
        const { error } = await supabase.from("bookings").insert({
            member_id: currentUser.id,
            class_id: classId,
        });
        if (error) throw error;
        await refreshFitness();
    };

    const cancelClass = async (classId: string) => {
        if (!currentUser) throw new Error("Authentication required.");
        const { error } = await supabase.from("bookings").delete().match({
            member_id: currentUser.id,
            class_id: classId,
        });
        if (error) throw error;
        await refreshFitness();
    };

    const bookPTSession = async (data: any) => {
        const { error } = await supabase.from("pt_sessions").insert(data);
        if (error) throw error;
        await refreshFitness();
    };

    const bookTrialSession = async (data: { coach_id: string; member_id: string; scheduled_date: string; scheduled_time: string }) => {
        const { error } = await supabase.from("pt_sessions").insert({
            ...data,
            session_type: "trial",
            status: "scheduled",
        });
        if (error) throw error;
        await refreshFitness();
    };

    const cancelPTSession = async (sessionId: string) => {
        const { error } = await supabase.from("pt_sessions").update({ status: "canceled" }).eq("id", sessionId);
        if (error) throw error;
        await refreshFitness();
    };

    const submitFreezeRequest = async (startDate: string, endDate: string, reason: string) => {
        if (!currentUser) throw new Error("Authentication required.");
        const { error } = await supabase.from("freeze_requests").insert({
            member_id: currentUser.id,
            start_date: startDate,
            end_date: endDate,
            reason,
            status: "pending",
        });
        if (error) throw error;
        await refreshFitness();
    };

    const addMember = async (data: { name: string; email: string }) => {
        const { error } = await supabase.from("profiles").insert({
            full_name: data.name,
            email: data.email,
            role: "member",
            membership_status: "active",
            member_code: (Math.floor(Math.random() * 9000) + 1000).toString(),
        });
        if (error) throw error;
        await refreshFitness();
    };

    const deleteMember = async (memberId: string) => {
        const member = members.find(m => m.id === memberId);
        if (member?.email === "michaelmitry13@gmail.com") {
            throw new Error("This core identity is immune to purge operations.");
        }
        const { error } = await supabase.from("profiles").delete().eq("id", memberId);
        if (error) throw error;
        await refreshFitness();
    };

    const updateMemberStatus = async (memberId: string, status: Member["membershipStatus"]) => {
        const { error } = await supabase.from("profiles").update({ membership_status: status }).eq("id", memberId);
        if (error) throw error;
        await refreshFitness();
    };

    const updateMemberRole = async (memberId: string, role: Member["role"]) => {
        const member = members.find(m => m.id === memberId);
        if (member?.email === "michaelmitry13@gmail.com" && role !== "admin") {
            throw new Error("This core identity role is immutable.");
        }
        const { error } = await supabase.from("profiles").update({ role }).eq("id", memberId);
        if (error) throw error;
        await refreshFitness();
    };

    const renewMembership = async (memberId: string) => {
        const newExpiry = new Date();
        newExpiry.setMonth(newExpiry.getMonth() + 1);
        const { error } = await supabase.from("profiles").update({
            membership_expiry: newExpiry.toISOString(),
            membership_status: "active"
        }).eq("id", memberId);
        if (error) throw error;
        await refreshFitness();
    };

    const addCoach = async (data: { name: string; email: string }) => {
        const { error: profileError } = await supabase.from("profiles").insert({
            full_name: data.name,
            email: data.email,
            role: "coach",
            membership_status: "active",
        });
        if (profileError) throw profileError;
        await refreshFitness();
    };

    const addClass = async (data: any) => {
        const { error } = await supabase.from("classes").insert({
            name: data.title,
            capacity: data.total_spots,
            start_time: new Date().toISOString(), // Default 
            duration_minutes: 60,
        });
        if (error) throw error;
        await refreshFitness();
    };

    const assignMembership = async (memberId: string, tierId: string) => {
        const { error } = await supabase.from("profiles").update({ membership_status: "active" }).eq("id", memberId);
        if (error) throw error;
        await refreshFitness();
    };

    const registerAttendance = async (code: string) => {
        const member = members.find(m => m.code === code);
        if (!member) throw new Error("Invalid member code.");
        const { error } = await supabase.from("attendance_logs").insert({
            member_id: member.id,
            checked_in_at: new Date().toISOString(),
            checked_in_by: "admin",
        });
        if (error) throw error;
        await refreshFitness();
    };

    const reviewFreezeRequest = async (requestId: string, status: "approved" | "rejected") => {
        const { error } = await supabase.from("freeze_requests").update({
            status,
            reviewed_at: new Date().toISOString()
        }).eq("id", requestId);
        if (error) throw error;
        await refreshFitness();
    };

    return (
        <FitnessContext.Provider value={{
            members, classes, ptPackages, ptSessions,
            coachAvailabilities, sessionPolicies, attendanceLogs,
            freezeRequests, classWaitlists, loading,
            bookClass, cancelClass, bookPTSession, bookTrialSession, cancelPTSession,
            submitFreezeRequest, addMember, deleteMember, updateMemberStatus,
            updateMemberRole, renewMembership, addCoach, addClass,
            assignMembership, registerAttendance, reviewFreezeRequest,
            refreshFitness
        }}>
            {children}
        </FitnessContext.Provider>
    );
}

export const useFitness = () => {
    const context = useContext(FitnessContext);
    if (context === undefined) {
        throw new Error("useFitness must be used within a FitnessProvider");
    }
    return context;
};
