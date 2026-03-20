import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { useKitchen } from "./KitchenContext";
import { useFitness } from "./FitnessContext";
import { useAdmin } from "./AdminContext";
import {
  Member, ClassSession, KitchenItem, KitchenOrder,
  MaintenanceLog, FinancialTransaction, Equipment,
  FacilityZone, OperatingGoal, SystemSettings,
  PTPackage, PTSession, CoachAvailability, SessionPolicy,
  AppNotification, Invitation, MembershipTier, PackageOffering,
  Nutritionist, NutritionAssessment, MealPlan, AttendanceLog,
  FreezeRequest, WaitlistEntry, Workout, Message, LegalAgreement,
  PromoCode, StaffShift, StaffAttendance, PayrollRecord,
  LibraryContent, PlatformEvent, EventRegistration,
  SessionType, SessionStatus
} from "../types";

export * from "../types";

export interface DataContextType {
  // Auth
  currentUser: Member | null;
  loading: boolean;
  error: string | null;
  // Kitchen
  kitchenItems: KitchenItem[];
  orders: KitchenOrder[];
  // Fitness
  members: Member[];
  classes: ClassSession[];
  ptPackages: PTPackage[];
  ptSessions: PTSession[];
  coachAvailabilities: CoachAvailability[];
  sessionPolicies: SessionPolicy[];
  attendanceLogs: AttendanceLog[];
  freezeRequests: FreezeRequest[];
  classWaitlists: WaitlistEntry[];
  // Admin
  operatingGoals: OperatingGoal[];
  transactions: FinancialTransaction[];
  equipment: Equipment[];
  facilityZones: FacilityZone[];
  maintenanceLogs: MaintenanceLog[];
  settings: SystemSettings;
  // Shared UI
  systemAlert: { message: string; type: "info" | "warning" | "error" | "success" } | null;
  setSystemAlert: (alert: any) => void;
  broadcastAlert: (message: string, type: "info" | "warning" | "error" | "success") => void;
  // Actions
  refreshData: () => Promise<void>;
  setCurrentUser: (user: Member | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, data: any) => Promise<void>;
  signOut: () => Promise<void>;
  bookClass: (classId: string) => Promise<void>;
  cancelClass: (classId: string) => Promise<void>;
  placeOrder: (items: any, totalPrice: number) => Promise<void>;
  updateOrderStatus: (orderId: string, status: KitchenOrder["status"]) => Promise<void>;
  updateSettings: (updates: Partial<SystemSettings>) => Promise<void>;
  addMaintenanceLog: (log: Omit<MaintenanceLog, "id" | "created_at">) => Promise<void>;
  submitFreezeRequest: (startDate: string, endDate: string, reason: string) => Promise<void>;
  bookPTSession: (data: any) => Promise<void>;
  cancelPTSession: (sessionId: string) => Promise<void>;
  addTransaction: (data: Omit<FinancialTransaction, "id" | "created_at">) => Promise<void>;
  // Placeholders for less used methods (could be moved to specific contexts later)
  [key: string]: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const kitchen = useKitchen();
  const fitness = useFitness();
  const admin = useAdmin();

  const [systemAlert, setSystemAlert] = useState<{ message: string; type: "info" | "warning" | "error" | "success" } | null>(null);

  const broadcastAlert = (message: string, type: "info" | "warning" | "error" | "success") => {
    setSystemAlert({ message, type });
    setTimeout(() => setSystemAlert(null), 5000);
  };

  const refreshData = async () => {
    await Promise.all([
      auth.refreshUser(),
      kitchen.refreshKitchen(),
      fitness.refreshFitness(),
      admin.refreshAdmin()
    ]);
  };

  const value: DataContextType = {
    // Current User / Auth
    currentUser: auth.currentUser,
    loading: auth.loading || kitchen.loading || fitness.loading || admin.loading,
    error: auth.error,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
    setCurrentUser: () => { }, // Managed by AuthContext now
    resetUserPassword: auth.resetPassword,

    // Kitchen
    kitchenItems: kitchen.kitchenItems,
    orders: kitchen.orders,
    placeOrder: kitchen.placeOrder,
    updateOrderStatus: kitchen.updateOrderStatus,

    // Fitness
    members: fitness.members,
    classes: fitness.classes,
    ptPackages: fitness.ptPackages,
    ptSessions: fitness.ptSessions,
    coachAvailabilities: fitness.coachAvailabilities,
    sessionPolicies: fitness.sessionPolicies,
    attendanceLogs: fitness.attendanceLogs,
    freezeRequests: fitness.freezeRequests,
    classWaitlists: fitness.classWaitlists,
    bookClass: fitness.bookClass,
    cancelClass: fitness.cancelClass,
    bookPTSession: fitness.bookPTSession,
    cancelPTSession: fitness.cancelPTSession,
    submitFreezeRequest: fitness.submitFreezeRequest,

    // Admin
    operatingGoals: admin.operatingGoals,
    transactions: admin.transactions,
    equipment: admin.equipment,
    facilityZones: admin.facilityZones,
    maintenanceLogs: admin.maintenanceLogs,
    settings: admin.settings,
    updateSettings: admin.updateSettings,
    addMaintenanceLog: admin.addMaintenanceLog,
    addTransaction: admin.addTransaction,

    // Shared UI
    systemAlert,
    setSystemAlert,
    broadcastAlert,
    refreshData,

    // Admin Actions (Missing links)
    addMember: fitness.addMember,
    deleteMember: fitness.deleteMember,
    updateMemberStatus: fitness.updateMemberStatus,
    updateMemberRole: fitness.updateMemberRole,
    renewMembership: fitness.renewMembership,
    addCoach: fitness.addCoach,
    addClass: fitness.addClass,
    assignMembership: fitness.assignMembership,
    registerAttendance: fitness.registerAttendance,
    reviewFreezeRequest: fitness.reviewFreezeRequest,

    // Remaining placeholders (To be refactored into domain contexts if needed)
    notifications: [],
    invitations: [],
    membershipTiers: [],
    packageOfferings: [],
    nutritionists: [],
    nutritionAssessments: [],
    mealPlans: [],
    workouts: [],
    messages: [],
    legalAgreements: [],
    promoCodes: [],
    staffShifts: [],
    staffAttendance: [],
    payrollRecords: [],
    libraryContent: [],
    events: [],
    eventRegistrations: []
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
