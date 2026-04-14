import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/firebase";
import {
    OperatingGoal, FinancialTransaction, Equipment,
    FacilityZone, SystemSettings, MaintenanceLog
} from "../types";
import { branding } from "../branding";

interface AdminContextType {
    operatingGoals: OperatingGoal[];
    transactions: FinancialTransaction[];
    equipment: Equipment[];
    facilityZones: FacilityZone[];
    maintenanceLogs: MaintenanceLog[];
    expenses: any[];
    refunds: any[];
    settings: SystemSettings;
    loading: boolean;
    updateSettings: (updates: Partial<SystemSettings>) => Promise<void>;
    addMaintenanceLog: (log: Omit<MaintenanceLog, "id" | "created_at">) => Promise<void>;
    addTransaction: (data: Omit<FinancialTransaction, "id" | "created_at">) => Promise<void>;
    refreshAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [operatingGoals, setOperatingGoals] = useState<OperatingGoal[]>([]);
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [facilityZones, setFacilityZones] = useState<FacilityZone[]>([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [refunds, setRefunds] = useState<any[]>([]);
    const [settings, setSettings] = useState<SystemSettings>({
        brandName: branding.name,
        timezone: "UTC+2",
        currency: "EGP",
        notificationsEnabled: true,
        mfaRequired: true,
        encryptionLevel: "AES-256",
        theme: localStorage.getItem("app-theme") || "default",
    });
    const [loading, setLoading] = useState(true);

    const refreshAdmin = async () => {
        try {
            const [goalsRes, transRes, equipRes, zonesRes, maintRes, settingsRes] = await Promise.all([
                supabase.from("operating_goals").select("*"),
                supabase.from("financial_transactions").select("*").order("created_at", { ascending: false }),
                supabase.from("equipment").select("*"),
                supabase.from("facility_zones").select("*"),
                supabase.from("maintenance_logs").select("*").order("created_at", { ascending: false }),
                supabase.from("system_settings").select("*").single()
            ]);

            if (goalsRes.data) setOperatingGoals(goalsRes.data);
            if (transRes.data) setTransactions(transRes.data);
            if (equipRes.data) setEquipment(equipRes.data);
            if (zonesRes.data) setFacilityZones(zonesRes.data);
            if (maintRes.data) setMaintenanceLogs(maintRes.data);

            const [expRes, refRes] = await Promise.all([
                supabase.from("financial_expenses").select("*"),
                supabase.from("financial_refunds").select("*")
            ]);
            if (expRes.data) setExpenses(expRes.data);
            if (refRes.data) setRefunds(refRes.data);

            if (settingsRes.data) {
                setSettings({
                    brandName: settingsRes.data.brand_name,
                    timezone: settingsRes.data.timezone,
                    currency: settingsRes.data.currency,
                    notificationsEnabled: settingsRes.data.notifications_enabled,
                    mfaRequired: settingsRes.data.mfa_required,
                    encryptionLevel: settingsRes.data.encryption_level,
                    theme: settingsRes.data.active_theme,
                });
            }
        } catch (err) {
            console.error("Error refreshing admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshAdmin();
    }, []);

    const updateSettings = async (updates: Partial<SystemSettings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
        const dbUpdates: any = {};
        if (updates.brandName !== undefined) dbUpdates.brand_name = updates.brandName;
        if (updates.theme !== undefined) dbUpdates.active_theme = updates.theme;
        // ... add other mapping if needed

        const { error } = await supabase.from("system_settings").update(dbUpdates).neq("id", "0000");
        if (error) throw error;
        await refreshAdmin();
    };

    const addMaintenanceLog = async (log: Omit<MaintenanceLog, "id" | "created_at">) => {
        const { error } = await supabase.from("maintenance_logs").insert(log);
        if (error) throw error;
        await refreshAdmin();
    };

    const addTransaction = async (data: Omit<FinancialTransaction, "id" | "created_at">) => {
        const { error } = await supabase.from("financial_transactions").insert(data);
        if (error) throw error;
        await refreshAdmin();
    };

    return (
        <AdminContext.Provider value={{
            operatingGoals, transactions, equipment,
            facilityZones, maintenanceLogs, expenses, refunds, settings, loading,
            updateSettings, addMaintenanceLog, addTransaction, refreshAdmin
        }}>
            {children}
        </AdminContext.Provider>
    );
}

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
};
