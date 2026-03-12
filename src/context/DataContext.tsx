import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import * as Notifications from "../lib/NotificationService";

// --- Interfaces ---

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "member" | "admin" | "coach" | "nutritionist";
  avatar: string;
  strain: number;
  recovery: number;
  badges: Badge[];
  riskStatus: "low" | "medium" | "high";
  code: string;
  bookedClasses: string[];
  membershipExpiry: string | null;
  membershipStatus: "active" | "suspended" | "expired" | "pending";
  lastAttendance: string | null;
  invitationsBalance: number;
}

export interface Invitation {
  id: string;
  member_id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  visit_date: string;
  status: "pending" | "used" | "expired";
  created_at: string;
}

export interface Badge {
  label: string;
  icon: string;
  achieved: boolean;
  count?: string;
}

export interface ClassSession {
  id: string;
  title: string;
  trainer: string;
  time: string;
  duration: string;
  spots_left: number;
  total_spots: number;
  date: string;
  watermark: string;
  image: string;
  tags: string[];
}

export interface KitchenItem {
  id: string;
  name: string;
  quantity: number;
  reorder_threshold: number;
  unit: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
}

export interface KitchenOrder {
  id: string;
  member_id: string;
  items: any;
  total_price: number;
  status: "pending" | "preparing" | "ready" | "picked_up";
  created_at: string;
}

export interface MaintenanceLog {
  id: string;
  asset_name: string;
  description: string;
  status: "completed" | "in_progress" | "scheduled";
  temporal_marker: string;
  initials: string;
  created_at: string;
}

export interface SystemSettings {
  brandName: string;
  timezone: string;
  currency: string;
  notificationsEnabled: boolean;
  mfaRequired: boolean;
  encryptionLevel: string;
  theme: string;
}

export interface FinancialTransaction {
  id: string;
  amount: number;
  transaction_type: "membership" | "package" | "kitchen" | "refund" | "other";
  status: "completed" | "pending" | "failed";
  description: string;
  member_id: string | null;
  created_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  status: "operational" | "needs_maintenance" | "out_of_orded";
  purchase_date: string;
  expected_lifespan_years: number;
  created_at: string;
}

export interface FacilityZone {
  id: string;
  name: string;
  status: "Good" | "Clean" | "Operational" | "Restocking" | "Maintenance";
  health_percentage: number;
  requires_warning: boolean;
  created_at: string;
}

export interface OperatingGoal {
  id: string;
  period: "daily" | "weekly" | "monthly";
  metric_name: string;
  current_value: number;
  target_value: number;
  currency: string | null;
  updated_at: string;
}

// --- PT Management Interfaces ---

export type SessionType =
  | "pt_1on1"
  | "partner"
  | "group"
  | "class"
  | "nutrition"
  | "trial";
export type SessionStatus =
  | "scheduled"
  | "completed"
  | "no_show"
  | "rescheduled"
  | "canceled";
export type PackageStatus = "active" | "expired" | "exhausted" | "cancelled";

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  pt_1on1: "Personal Training (1-on-1)",
  partner: "Partner Session",
  group: "Small Group (3-5)",
  class: "Class",
  nutrition: "Nutrition Consultation",
  trial: "Trial Session",
};

export interface SessionPolicy {
  id: string;
  session_type: SessionType;
  cancellation_window_hours: number;
  no_show_deducts: boolean;
  max_reschedules: number;
  package_validity_days: number;
  max_capacity: number;
}

export interface CoachAvailability {
  id: string;
  coach_id: string;
  day_of_week: number | null; // 0=Sun, 6=Sat
  specific_date: string | null; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string;
  is_day_off: boolean;
  max_pt_1on1: number;
  max_partner: number;
  max_group: number;
  max_class: number;
  max_nutrition: number;
}

export interface PTPackage {
  id: string;
  member_id: string;
  coach_id: string | null;
  package_type: SessionType;
  total_sessions: number;
  remaining_sessions: number;
  price_paid: number;
  payment_confirmed: boolean;
  starts_at: string;
  expires_at: string | null;
  status: PackageStatus;
  reschedules_used: number;
  created_at: string;
  // joined fields
  member_name?: string;
  coach_name?: string;
}

export interface MembershipTier {
  id: string;
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  features: string[];
}

export interface PTSession {
  id: string;
  package_id: string;
  coach_id: string;
  member_id: string;
  session_type: SessionType;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: SessionStatus;
  notes: string | null;
  created_at: string;
  // joined fields
  member_name?: string;
  coach_name?: string;
}

export interface CoachReview {
  id: string;
  coach_id: string;
  member_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: Notifications.NotificationType;
  is_read: boolean;
  related_session_id: string | null;
  created_at: string;
}

export interface PackageOffering {
  id: string;
  category: string;
  sub_category: string | null;
  name: string;
  session_type: SessionType;
  total_sessions: number;
  price_member: number;
  price_outsider: number | null;
  description: string | null;
  is_active: boolean;
}

export interface Nutritionist {
  id: string;
  bio: string | null;
  specialties: string[];
  experience_years: number | null;
  rating: number;
}

export interface NutritionAssessment {
  id: string;
  member_id: string;
  nutritionist_id: string;
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_pct: number | null;
  muscle_mass_kg: number | null;
  daily_calories_target: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fats_grams: number | null;
  notes: string | null;
  assessment_date: string;
  created_at: string;
}

export interface MealPlan {
  id: string;
  member_id: string;
  nutritionist_id: string;
  title: string;
  description: string | null;
  meals: any[];
  start_date: string;
  end_date: string | null;
  status: 'active' | 'archived';
  created_at: string;
}

export interface AttendanceLog {
  id: string;
  member_id: string;
  checked_in_at: string;
  checked_in_by: 'self' | 'admin';
}

export interface FreezeRequest {
  id: string;
  member_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  member_name?: string;
}

export interface WaitlistEntry {
  id: string;
  schedule_id: string;
  member_id: string;
  joined_at: string;
  status: 'waiting' | 'promoted' | 'cancelled';
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  completed: boolean;
  created_at: string;
}

export interface Workout {
  id: string;
  member_id: string;
  date: string;
  notes?: string;
  created_at: string;
  exercises?: WorkoutExercise[];
}


// --- Context Type ---

interface DataContextType {
  members: Member[];
  classes: ClassSession[];
  kitchenItems: KitchenItem[];
  orders: KitchenOrder[];
  maintenanceLogs: MaintenanceLog[];
  transactions: FinancialTransaction[];
  equipment: Equipment[];
  facilityZones: FacilityZone[];
  operatingGoals: OperatingGoal[];
  settings: SystemSettings;
  currentUser: Member | null;
  loading: boolean;
  error: string | null;
  systemAlert: {
    message: string;
    type: "info" | "warning" | "error" | "success";
  } | null;
  setSystemAlert: (
    alert: {
      message: string;
      type: "info" | "warning" | "error" | "success";
    } | null,
  ) => void;
  setCurrentUser: (user: Member | null) => void;
  bookClass: (classId: string) => Promise<void>;
  cancelClass: (classId: string) => Promise<void>;
  placeOrder: (items: any, totalPrice: number) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: KitchenOrder["status"],
  ) => Promise<void>;
  updateSettings: (updates: Partial<SystemSettings>) => Promise<void>;
  addMaintenanceLog: (
    log: Omit<MaintenanceLog, "id" | "created_at">,
  ) => Promise<void>;
  refreshData: () => Promise<void>;
  addMember: (data: Partial<Member>) => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;
  updateMemberStatus: (
    memberId: string,
    status: Member["membershipStatus"],
  ) => Promise<void>;
  updateMemberRole: (memberId: string, role: Member["role"]) => Promise<void>;
  renewMembership: (memberId: string) => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  addCoach: (data: Partial<Member>) => Promise<void>;
  addClass: (data: any) => Promise<void>;
  registerAttendance: (memberCode: string) => Promise<void>;
  broadcastAlert: (
    message: string,
    type: "info" | "warning" | "error" | "success",
  ) => void;
  // PT Management
  ptPackages: PTPackage[];
  ptSessions: PTSession[];
  coachAvailabilities: CoachAvailability[];
  sessionPolicies: SessionPolicy[];
  notifications: AppNotification[];
  createPackage: (
    data: Omit<
      PTPackage,
      "id" | "created_at" | "member_name" | "coach_name" | "reschedules_used"
    >,
  ) => Promise<void>;
  invitations: Invitation[];
  createInvitation: (data: Omit<Invitation, "id" | "created_at" | "status" | "member_id">) => Promise<void>;
  bookPTSession: (data: {
    package_id: string;
    coach_id: string;
    member_id: string;
    session_type: SessionType;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes?: number;
  }) => Promise<void>;
  bookTrialSession: (data: {
    coach_id: string;
    member_id: string;
    scheduled_date: string;
    scheduled_time: string;
  }) => Promise<void>;
  adminAddSession: (data: {
    coach_id: string;
    member_id: string;
    session_type: SessionType;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes?: number;
  }) => Promise<void>;
  cancelPTSession: (sessionId: string) => Promise<void>;
  reschedulePTSession: (
    sessionId: string,
    newDate: string,
    newTime: string,
  ) => Promise<void>;
  updateSessionStatus: (
    sessionId: string,
    status: SessionStatus,
  ) => Promise<void>;
  setCoachAvailability: (data: Omit<CoachAvailability, "id">) => Promise<void>;
  deleteCoachAvailability: (slotId: string) => Promise<void>;
  updateSessionPolicy: (
    policyId: string,
    updates: Partial<SessionPolicy>,
  ) => Promise<void>;

  // Membership Actions
  membershipTiers: MembershipTier[];
  addMembershipTier: (
    tier: Omit<MembershipTier, "id" | "created_at">,
  ) => Promise<void>;
  deleteMembershipTier: (tierId: string) => Promise<void>;
  assignMembership: (memberId: string, tierId: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  confirmPackagePayment: (packageId: string) => Promise<void>;

  // New Global Functions
  coachReviews: CoachReview[];
  addTransaction: (
    data: Omit<FinancialTransaction, "id" | "created_at">,
  ) => Promise<void>;

  // Nutritionists
  nutritionists: Nutritionist[];
  nutritionAssessments: NutritionAssessment[];
  mealPlans: MealPlan[];

  // Offerings
  packageOfferings: PackageOffering[];

  // Attendance
  attendanceLogs: AttendanceLog[];

  // Freeze Requests
  freezeRequests: FreezeRequest[];
  submitFreezeRequest: (startDate: string, endDate: string, reason: string) => Promise<void>;
  reviewFreezeRequest: (requestId: string, status: 'approved' | 'rejected', adminNotes?: string) => Promise<void>;

  // Waitlists
  classWaitlists: WaitlistEntry[];
  joinWaitlist: (classId: string) => Promise<void>;
  leaveWaitlist: (classId: string) => Promise<void>;

  // Workouts
  workouts: Workout[];
  logWorkout: (date: string, notes: string, exercises: Omit<WorkoutExercise, 'id' | 'workout_id' | 'created_at'>[]) => Promise<void>;
  messages: Message[];
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  legalAgreements: LegalAgreement[];
  signWaiver: (documentType: string, signature?: string) => Promise<void>;
  promoCodes: PromoCode[];
  validatePromoCode: (code: string) => Promise<PromoCode | null>;
  applyReferral: (referrerCode: string) => Promise<void>;

  // Staff Management
  staffShifts: StaffShift[];
  staffAttendance: StaffAttendance[];
  payrollRecords: PayrollRecord[];
  addStaffShift: (data: Omit<StaffShift, 'id' | 'created_at' | 'staff_name'>) => Promise<void>;
  deleteStaffShift: (id: string) => Promise<void>;
  punchIn: () => Promise<void>;
  punchOut: () => Promise<void>;

  // Content Library
  libraryContent: LibraryContent[];
  addContent: (data: Omit<LibraryContent, 'id' | 'created_at' | 'author_name'>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;

  // Events
  events: PlatformEvent[];
  eventRegistrations: EventRegistration[];
  registerForEvent: (eventId: string) => Promise<void>;
  cancelEventRegistration: (registrationId: string) => Promise<void>;
  createEvent: (event: Partial<PlatformEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_amount: number;
  discount_type: 'percentage' | 'fixed';
  usage_limit: number | null;
  times_used: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  reward_status: 'pending' | 'completed' | 'invalid';
  created_at: string;
}

export interface LegalAgreement {
  id: string;
  member_id: string;
  document_type: string;
  agreed_at: string;
  ip_address?: string;
  signature_data?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

export interface StaffShift {
  id: string;
  staff_id: string;
  start_time: string;
  end_time: string;
  role: 'coach' | 'admin' | 'nutritionist';
  created_at: string;
  staff_name?: string;
}

export interface StaffAttendance {
  id: string;
  staff_id: string;
  punch_in: string;
  punch_out: string | null;
  status: 'present' | 'late' | 'absent';
  created_at: string;
  staff_name?: string;
}

export interface PayrollRecord {
  id: string;
  staff_id: string;
  period_start: string;
  period_end: string;
  base_pay: number;
  commissions: number;
  bonuses: number;
  total_pay: number;
  status: 'draft' | 'paid';
  created_at: string;
  staff_name?: string;
}

export interface LibraryContent {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'article' | 'recipe' | 'document';
  url: string;
  thumbnail_url?: string;
  tags: string[];
  is_premium: boolean;
  created_at: string;
  author_id?: string;
  author_name?: string;
}

export interface PlatformEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'workshop' | 'seminar' | 'competition' | 'social';
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  price: number;
  image_url?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  member_id: string;
  status: 'registered' | 'attended' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'refunded' | 'free';
  registered_at: string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>([]);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [facilityZones, setFacilityZones] = useState<FacilityZone[]>([]);
  const [operatingGoals, setOperatingGoals] = useState<OperatingGoal[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    brandName: "INZAN Athletics",
    timezone: "UTC+2",
    currency: "EGP",
    notificationsEnabled: true,
    mfaRequired: true,
    encryptionLevel: "AES-256",
    theme: localStorage.getItem("app-theme") || "default",
  });

  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemAlert, setSystemAlert] = useState<{
    message: string;
    type: "info" | "warning" | "error" | "success";
  } | null>(null);

  // PT Management state
  const [ptPackages, setPtPackages] = useState<PTPackage[]>([]);
  const [ptSessions, setPtSessions] = useState<PTSession[]>([]);
  const [coachAvailabilities, setCoachAvailabilities] = useState<
    CoachAvailability[]
  >([]);
  const [sessionPolicies, setSessionPolicies] = useState<SessionPolicy[]>([]);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>(
    [],
  );
  const [coachReviews, setCoachReviews] = useState<CoachReview[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);

  const [packageOfferings, setPackageOfferings] = useState<PackageOffering[]>([]);

  // Nutritionist state
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [nutritionAssessments, setNutritionAssessments] = useState<NutritionAssessment[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);

  // Attendance & Freeze state
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [freezeRequests, setFreezeRequests] = useState<FreezeRequest[]>([]);
  const [classWaitlists, setClassWaitlists] = useState<WaitlistEntry[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [legalAgreements, setLegalAgreements] = useState<LegalAgreement[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  // Staff Management
  const [staffShifts, setStaffShifts] = useState<StaffShift[]>([]);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendance[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);

  // Content Library
  const [libraryContent, setLibraryContent] = useState<LibraryContent[]>([]);

  // Events
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);

  const broadcastAlert = (
    message: string,
    type: "info" | "warning" | "error" | "success",
  ) => {
    setSystemAlert({ message, type });
    setTimeout(() => setSystemAlert(null), 5000);
  };

  const updateSettings = async (updates: Partial<SystemSettings>) => {
    // Optimistic update
    setSettings((prev) => ({ ...prev, ...updates }));

    try {
      const dbUpdates: any = {};
      if (updates.brandName !== undefined) dbUpdates.brand_name = updates.brandName;
      if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.notificationsEnabled !== undefined) dbUpdates.notifications_enabled = updates.notificationsEnabled;
      if (updates.mfaRequired !== undefined) dbUpdates.mfa_required = updates.mfaRequired;
      if (updates.encryptionLevel !== undefined) dbUpdates.encryption_level = updates.encryptionLevel;
      if (updates.theme !== undefined) dbUpdates.active_theme = updates.theme;

      const { error } = await supabase
        .from("system_settings")
        .update(dbUpdates)
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all (should only be one)

      if (error) throw error;
      broadcastAlert("System parameters adjusted.", "success");
    } catch (err: any) {
      console.error("Error updating settings:", err);
      broadcastAlert("Failed to save settings to database.", "error");
      await fetchAllData(); // Revert on failure
    }
  };

  const addMaintenanceLog = async (
    log: Omit<MaintenanceLog, "id" | "created_at">,
  ) => {
    const { error } = await supabase.from("maintenance_logs").insert(log);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert(
      `Maintenance event logged for ${log.asset_name}.`,
      "success",
    );
  };

  // ============================================================
  // FETCH ALL DATA (extended with PT tables)
  // ============================================================
  const fetchAllData = async () => {
    try {
      const [
        { data: profilesData },
        { data: classesData },
        { data: inventoryData },
        { data: bookingsData },
        { data: ordersData },
        { data: maintenanceData },
        { data: packagesData },
        { data: sessionsData },
        { data: availabilityData },
        { data: policiesData },
        { data: notificationsData },
        { data: membershipTiersData },
        { data: transactionsData },
        { data: equipmentData },
        { data: facilityZonesData },
        { data: operatingGoalsData },
        { data: reviewsData },
        { data: invitationsData },
        { data: nutritionistsData },
        { data: assessmentsData },
        { data: mealPlansData },
        { data: offeringsData },
        { data: attendanceData },
        { data: freezeData },
        { data: systemSettingsData },
        { data: waitlistsData },
        { data: workoutsData },
        { data: messagesData },
        { data: legalAgreementsData },
        { data: promoCodesData },
        { data: shiftsData },
        { data: staffAttendanceData },
        { data: payrollData },
        { data: libraryContentData },
        { data: eventsData },
        { data: eventRegistrationsData },
      ] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase
          .from("classes")
          .select("*, coach:coaches(profiles(full_name))"),
        supabase.from("kitchen_inventory").select("*"),
        supabase.from("bookings").select("*"),
        supabase
          .from("kitchen_orders")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("maintenance_logs")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("pt_packages")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("pt_sessions")
          .select("*")
          .order("scheduled_date", { ascending: true }),
        supabase
          .from("coach_availabilities")
          .select("*")
          .order("day_of_week", { ascending: true }),
        supabase.from("session_policies").select("*"),
        supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("membership_tiers")
          .select("*")
          .order("price", { ascending: true }),
        supabase
          .from("financial_transactions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("equipment").select("*"),
        supabase.from("facility_zones").select("*"),
        supabase.from("operating_goals").select("*"),
        supabase.from("coach_reviews").select("*"),
        supabase.from("invitations").select("*").order("created_at", { ascending: false }),
        supabase.from("nutritionists").select("*"),
        supabase.from("nutrition_assessments").select("*"),
        supabase.from("meal_plans").select("*"),
        supabase.from("package_offerings").select("*"),
        supabase.from("attendance_logs").select("*").order("checked_in_at", { ascending: false }).limit(500),
        supabase.from("freeze_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("system_settings").select("*").single(),
        supabase.from("class_waitlists").select("*").order("joined_at", { ascending: true }),
        supabase.from("workouts").select(`*, exercises:workout_exercises(*)`).order("date", { ascending: false }),
        supabase.from("messages").select("*, sender:profiles!messages_sender_id_fkey(full_name), receiver:profiles!messages_receiver_id_fkey(full_name)").order("created_at", { ascending: true }),
        supabase.from("legal_agreements").select("*"),
        supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
        supabase.from("staff_shifts").select("*").order("start_time", { ascending: true }),
        supabase.from("staff_attendance").select("*").order("punch_in", { ascending: false }),
        supabase.from("payroll_records").select("*").order("period_start", { ascending: false }),
        supabase.from("library_content").select("*, author:profiles!library_content_author_id_fkey(full_name)").order("created_at", { ascending: false }),
        supabase.from("events").select("*").order("start_time", { ascending: true }),
        supabase.from("event_registrations").select("*"),
      ]);

      const mappedMembers: Member[] =
        profilesData?.map((p) => ({
          id: p.id,
          name: p.full_name,
          email: p.email,
          role: p.role,
          avatar: p.avatar_url || `https://i.pravatar.cc/150?u=${p.id}`,
          strain: p.current_strain,
          recovery: p.current_recovery,
          badges: p.athletic_passport_badges || [],
          riskStatus: p.risk_status || "low",
          code: p.member_code || "0000",
          bookedClasses:
            bookingsData
              ?.filter((b) => b.member_id === p.id)
              .map((b) => b.class_id) || [],
          membershipExpiry: p.membership_expiry,
          membershipStatus: p.membership_status || "pending",
          lastAttendance: p.last_attendance || null,
          invitationsBalance: p.invitations_balance || 0,
        })) || [];

      setMembers(mappedMembers);

      setClasses(
        classesData?.map((c) => ({
          id: c.id,
          title: c.name,
          trainer: c.coach?.profiles?.full_name || "Coach",
          time: new Date(c.start_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          duration: `${c.duration_minutes} Mins`,
          spots_left:
            c.capacity -
            (bookingsData?.filter((b) => b.class_id === c.id).length || 0),
          total_spots: c.capacity,
          date: new Date(c.start_time).toLocaleDateString(),
          watermark: c.tags?.[0]?.toUpperCase() || "GENERAL",
          image:
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
          tags: c.tags || [],
        })) || [],
      );

      setKitchenItems(
        inventoryData?.map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          reorder_threshold: i.reorder_threshold,
          unit: i.unit,
          category: i.category,
          price: Number(i.price) || 0,
          description: i.description,
          image_url: i.image_url,
        })) || [],
      );

      setOrders(
        ordersData?.map((o) => ({
          id: o.id,
          member_id: o.member_id,
          items: o.items,
          total_price: Number(o.total_price),
          status: o.status,
          created_at: o.created_at,
        })) || [],
      );

      setMaintenanceLogs(maintenanceData || []);
      setTransactions(transactionsData || []);
      setEquipment(equipmentData || []);
      setFacilityZones(facilityZonesData || []);
      setOperatingGoals(operatingGoalsData || []);

      // PT Data
      const memberLookup = new Map(mappedMembers.map((m) => [m.id, m.name]));
      setPtPackages(
        (packagesData || []).map((p) => ({
          ...p,
          price_paid: Number(p.price_paid),
          member_name: memberLookup.get(p.member_id) || "Unknown",
          coach_name: memberLookup.get(p.coach_id) || "Any Coach",
        })),
      );

      setPtSessions(
        (sessionsData || []).map((s) => ({
          ...s,
          member_name: memberLookup.get(s.member_id) || "Unknown",
          coach_name: memberLookup.get(s.coach_id) || "Unknown",
        })),
      );

      setCoachAvailabilities(availabilityData || []);
      setSessionPolicies(policiesData || []);
      setAppNotifications(notificationsData || []);
      setMembershipTiers(membershipTiersData || []);

      setCoachReviews(reviewsData || []);
      setInvitations(invitationsData || []);
      setNutritionists(nutritionistsData || []);
      setNutritionAssessments(assessmentsData || []);
      setMealPlans(mealPlansData || []);
      setPackageOfferings(offeringsData || []);
      setAttendanceLogs(attendanceData || []);
      setFreezeRequests(
        (freezeData || []).map((fr: any) => ({
          ...fr,
          member_name: (profilesData || []).find((p: any) => p.id === fr.member_id)?.full_name || 'Unknown',
        }))
      );
      setClassWaitlists(waitlistsData || []);
      setWorkouts(workoutsData || []);
      setMessages((messagesData || []).map((m: any) => ({
        ...m,
        sender_name: m.sender?.full_name || 'Unknown',
        receiver_name: m.receiver?.full_name || 'Unknown'
      })));
      setLegalAgreements(legalAgreementsData || []);
      setPromoCodes(promoCodesData || []);
      
      setStaffShifts((shiftsData || []).map((s: any) => ({
        ...s,
        staff_name: (profilesData || []).find((p: any) => p.id === s.staff_id)?.full_name || 'Unknown'
      })));
      setStaffAttendance((staffAttendanceData || []).map((a: any) => ({
        ...a,
        staff_name: (profilesData || []).find((p: any) => p.id === a.staff_id)?.full_name || 'Unknown'
      })));
      setPayrollRecords((payrollData || []).map((pr: any) => ({
        ...pr,
        staff_name: (profilesData || []).find((p: any) => p.id === pr.staff_id)?.full_name || 'Unknown'
      })));
      setLibraryContent((libraryContentData || []).map((lc: any) => ({
        ...lc,
        author_name: (profilesData || []).find((p: any) => p.id === lc.author_id)?.full_name || 'Unknown'
      })));

      if (systemSettingsData) {
        setSettings({
          brandName: systemSettingsData.brand_name,
          timezone: systemSettingsData.timezone,
          currency: systemSettingsData.currency,
          notificationsEnabled: systemSettingsData.notifications_enabled,
          mfaRequired: systemSettingsData.mfa_required,
          encryptionLevel: systemSettingsData.encryption_level,
          theme: systemSettingsData.active_theme,
        });
      }

      // Auth
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const found = mappedMembers.find((m) => m.id === session.user.id);
        if (found) setCurrentUser(found);
      } else {
        setCurrentUser(null);
      }
    } catch (err: any) {
      console.error("Data Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(() => {
      fetchAllData();
    });
    return () => {
      authListener.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
    localStorage.setItem("app-theme", settings.theme);
  }, [settings.theme]);

  // ============================================================
  // EXISTING CRUD
  // ============================================================
  const bookClass = async (classId: string) => {
    if (!currentUser) throw new Error("Auth required");
    
    // Conflict Detection Logic
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) throw new Error("Class not found");
    
    const targetStart = new Date(`${targetClass.date}T${targetClass.time}`).getTime();
    const targetDuration = parseInt(targetClass.duration) || 60;
    const targetEnd = targetStart + targetDuration * 60000;

    const hasConflict = currentUser.bookedClasses?.some(bookedId => {
      const bookedClass = classes.find(c => c.id === bookedId);
      if (!bookedClass) return false;
      const bookedStart = new Date(`${bookedClass.date}T${bookedClass.time}`).getTime();
      const bookedDuration = parseInt(bookedClass.duration) || 60;
      const bookedEnd = bookedStart + bookedDuration * 60000;

      return (
        (targetStart >= bookedStart && targetStart < bookedEnd) ||
        (targetEnd > bookedStart && targetEnd <= bookedEnd) ||
        (targetStart <= bookedStart && targetEnd >= bookedEnd)
      );
    });

    if (hasConflict) {
      throw new Error("Schedule Conflict: You already have a class booked at this time.");
    }

    const { error } = await supabase.from("bookings").insert({
      member_id: currentUser.id,
      class_id: classId,
    });
    if (error) throw error;
    await fetchAllData();
  };

  const cancelClass = async (classId: string) => {
    if (!currentUser) throw new Error("Auth required");
    const { error } = await supabase.from("bookings").delete().match({
      member_id: currentUser.id,
      class_id: classId,
    });
    if (error) throw error;

    // Waitlist auto-promotion logic
    // Sort so oldest waiting entry gets promoted
    const waitingList = classWaitlists
      .filter(w => w.schedule_id === classId && w.status === 'waiting')
      .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());
      
    if (waitingList.length > 0) {
      const nextMember = waitingList[0];
      // Insert booking for the waitlisted member
      await supabase.from("bookings").insert({
        member_id: nextMember.member_id,
        class_id: classId,
      });
      // Mark waitlist entry as promoted
      await supabase.from("class_waitlists").update({ status: 'promoted' }).eq('id', nextMember.id);
    }

    await fetchAllData();
  };

  const joinWaitlist = async (classId: string) => {
    if (!currentUser) throw new Error("Auth required");
    const { error } = await supabase.from("class_waitlists").insert({
      member_id: currentUser.id,
      schedule_id: classId,
      status: 'waiting'
    });
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Joined waitlist for this class.", "success");
  };

  const leaveWaitlist = async (classId: string) => {
    if (!currentUser) throw new Error("Auth required");
    // Only update 'waiting' entries to 'cancelled' or just delete them. Let's delete for simplicity or update? DB policy allows delete/update. We'll delete.
    const { error } = await supabase.from("class_waitlists").delete().match({
      member_id: currentUser.id,
      schedule_id: classId,
      status: 'waiting' // Only remove if still waiting
    });
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Left waitlist.", "info");
  };

  const logWorkout = async (date: string, notes: string, exercises: Omit<WorkoutExercise, 'id' | 'workout_id' | 'created_at'>[]) => {
    if (!currentUser) throw new Error("Auth required");
    
    // Create workout record
    const { data: currentWorkout, error: workoutError } = await supabase.from("workouts").insert({
      member_id: currentUser.id,
      date: date || new Date().toISOString().split('T')[0],
      notes: notes || null
    }).select().single();

    if (workoutError) throw workoutError;

    // Add exercises if any
    if (exercises.length > 0) {
      const exerciseRecords = exercises.map(ex => ({
        workout_id: currentWorkout.id,
        exercise_name: ex.exercise_name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        completed: ex.completed
      }));
      
      const { error: exercisesError } = await supabase.from("workout_exercises").insert(exerciseRecords);
      if (exercisesError) throw exercisesError;
    }

    await fetchAllData();
    broadcastAlert("Workout logged successfully.", "success");
  };

  const placeOrder = async (items: any[], totalPrice: number) => {
    if (!currentUser) throw new Error("Auth required");
    const { error } = await supabase.from("kitchen_orders").insert({
      member_id: currentUser.id,
      items,
      total_price: totalPrice,
      status: "pending",
    });
    if (error) throw error;

    // Log the transaction organically
    const { error: txError } = await supabase.from("financial_transactions").insert({
      amount: totalPrice,
      transaction_type: "kitchen",
      status: "completed",
      description: "EK Kitchen Order",
      member_id: currentUser.id,
    });
    if (txError) throw txError;

    // Auto-deduct inventory
    for (const orderItem of items) {
      const inventoryItem = kitchenItems.find(item => item.id === orderItem.id);
      if (inventoryItem) {
        const newQty = Math.max(0, inventoryItem.quantity - orderItem.quantity);
        await supabase
          .from("kitchen_inventory")
          .update({ quantity: newQty })
          .eq("id", inventoryItem.id);
      }
    }

    await fetchAllData();
  };

  const updateOrderStatus = async (
    orderId: string,
    status: KitchenOrder["status"],
  ) => {
    const { error } = await supabase
      .from("kitchen_orders")
      .update({ status })
      .eq("id", orderId);
    if (error) throw error;
    await fetchAllData();
  };

  const addMember = async (data: Partial<Member>) => {
    const { error } = await supabase.from("profiles").insert({
      id: crypto.randomUUID(),
      full_name: data.name,
      email: data.email,
      role: "member",
      member_code: data.code, // Let DB default handle if undefined
      current_strain: 0,
      current_recovery: 100,
      athletic_passport_badges: [],
    });
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("New member registered in system.", "success");
  };

  const deleteMember = async (memberId: string) => {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", memberId);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Member profile deleted.", "warning");
  };

  const updateMemberStatus = async (
    memberId: string,
    status: Member["membershipStatus"],
  ) => {
    const { error } = await supabase
      .from("profiles")
      .update({ membership_status: status })
      .eq("id", memberId);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert(`Member status updated to ${status}.`, "info");
  };

  const updateMemberRole = async (memberId: string, role: Member["role"]) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", memberId);
    if (error) throw error;

    // If changing to coach, make sure they have a coach record
    if (role === "coach") {
      const { data: existingCoach } = await supabase
        .from("coaches")
        .select("id")
        .eq("id", memberId)
        .single();
      if (!existingCoach) {
        await supabase
          .from("coaches")
          .insert({ id: memberId, specialization: "General Athletics" });
      }
    }

    if (role === "nutritionist") {
      const { data: existingNutri } = await supabase
        .from("nutritionists")
        .select("id")
        .eq("id", memberId)
        .single();
      if (!existingNutri) {
        await supabase
          .from("nutritionists")
          .insert({ id: memberId, specialties: ["General Nutrition"] });
      }
    }

    await fetchAllData();
    broadcastAlert(
      `Entity protocol upgraded to ${role.toUpperCase()}.`,
      "success",
    );
  };

  const renewMembership = async (memberId: string) => {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    const { error } = await supabase
      .from("profiles")
      .update({
        membership_expiry: expiryDate.toISOString(),
        membership_status: "active",
      })
      .eq("id", memberId);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Membership renewed for 1 cycle.", "success");
  };

  const resetUserPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    broadcastAlert(
      `Password reset payload transmitted to ${email}.`,
      "success",
    );
  };

  const addCoach = async (data: Partial<Member>) => {
    const { data: profile, error: pError } = await supabase
      .from("profiles")
      .insert({
        id: crypto.randomUUID(),
        full_name: data.name,
        email: data.email,
        role: "coach",
        member_code: data.code, // Let DB default handle if undefined
      })
      .select()
      .single();

    if (pError) throw pError;

    const { error: cError } = await supabase.from("coaches").insert({
      id: profile.id,
      specialization: "General Athletics",
    });

    if (cError) throw cError;
    await fetchAllData();
    broadcastAlert("New coach profile created.", "success");
  };

  const addClass = async (data: any) => {
    const { error } = await supabase.from("classes").insert({
      name: data.title,
      coach_id: data.coach_id,
      start_time: data.start_time,
      duration_minutes: data.duration_minutes,
      capacity: data.capacity,
      tags: data.tags,
    });
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Class session updated in schedule.", "success");
  };

  const registerAttendance = async (memberCode: string) => {
    const member = members.find((m) => m.code === memberCode);
    if (!member) throw new Error("Member not found in system.");

    const now = new Date().toISOString();
    const isAdmin = currentUser?.role === 'admin';

    // Update last_attendance on profile
    const { error } = await supabase
      .from("profiles")
      .update({ last_attendance: now })
      .eq("id", member.id);
    if (error) throw error;

    // Insert attendance log
    const { error: logError } = await supabase
      .from("attendance_logs")
      .insert({
        member_id: member.id,
        checked_in_at: now,
        checked_in_by: isAdmin ? 'admin' : 'self',
      });
    if (logError) console.error('Attendance log error:', logError);

    await fetchAllData();
    broadcastAlert(`Attendance registered for ${member.name}.`, "success");
  };

  // ============================================================
  // PT MANAGEMENT CRUD
  // ============================================================

  const createPackage = async (
    data: Omit<
      PTPackage,
      "id" | "created_at" | "member_name" | "coach_name" | "reschedules_used"
    >,
  ) => {
    const policy = sessionPolicies.find(
      (p) => p.session_type === data.package_type,
    );
    const expiresAt =
      data.expires_at ||
      (policy
        ? new Date(
          Date.now() + policy.package_validity_days * 86400000,
        ).toISOString()
        : new Date(Date.now() + 90 * 86400000).toISOString());

    const { error, data: newPkg } = await supabase.from("pt_packages").insert({
      member_id: data.member_id,
      coach_id: data.coach_id,
      package_type: data.package_type,
      total_sessions: data.total_sessions,
      remaining_sessions: data.remaining_sessions || data.total_sessions,
      price_paid: data.price_paid,
      payment_confirmed: data.payment_confirmed,
      starts_at: data.starts_at || new Date().toISOString(),
      expires_at: expiresAt,
      status: data.status || "active",
    }).select().single();
    if (error) throw error;

    if (data.payment_confirmed && data.price_paid > 0) {
      await supabase.from("financial_transactions").insert({
        amount: data.price_paid,
        transaction_type: "package",
        status: "completed",
        description: `PT Package: ${data.package_type}`,
        member_id: data.member_id,
      });
    }

    await fetchAllData();
    broadcastAlert("Package created successfully.", "success");
  };

  const confirmPackagePayment = async (packageId: string) => {
    const pkg = ptPackages.find(p => p.id === packageId);

    const { error } = await supabase
      .from("pt_packages")
      .update({ payment_confirmed: true })
      .eq("id", packageId);
    if (error) throw error;

    if (pkg && pkg.price_paid > 0) {
      await supabase.from("financial_transactions").insert({
        amount: pkg.price_paid,
        transaction_type: "package",
        status: "completed",
        description: `PT Package Payment Confirmed`,
        member_id: pkg.member_id,
      });
    }

    await fetchAllData();
    broadcastAlert("Payment confirmed — booking unlocked.", "success");
  };

  const bookPTSession = async (data: {
    package_id: string;
    coach_id: string;
    member_id: string;
    session_type: SessionType;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes?: number;
  }) => {
    // 1. Check package balance
    const pkg = ptPackages.find((p) => p.id === data.package_id);
    if (!pkg) throw new Error("Package not found.");
    if (!pkg.payment_confirmed)
      throw new Error("Payment not confirmed. Contact front desk.");
    if (pkg.remaining_sessions <= 0)
      throw new Error("No sessions remaining in this package.");
    if (pkg.status !== "active") throw new Error("Package is not active.");
    if (pkg.expires_at && new Date(pkg.expires_at) < new Date())
      throw new Error("Package has expired.");

    // 2. Check coach capacity for that slot
    const dayOfWeek = new Date(data.scheduled_date).getDay();
    const dateStr = data.scheduled_date;

    // 1. Check for specific date override first
    let coachSlots = coachAvailabilities.filter(
      (a) => a.coach_id === data.coach_id && a.specific_date === dateStr,
    );

    // 2. If no specific date entries, fall back to day of week
    if (coachSlots.length === 0) {
      coachSlots = coachAvailabilities.filter(
        (a) =>
          a.coach_id === data.coach_id &&
          a.day_of_week === dayOfWeek &&
          a.specific_date === null,
      );
    }

    const matchingSlot = coachSlots.find(
      (s) =>
        !s.is_day_off &&
        s.start_time <= data.scheduled_time &&
        s.end_time > data.scheduled_time,
    );

    if (!matchingSlot) throw new Error("Coach is not available at this time.");

    const capacityKey = `max_${data.session_type}` as keyof CoachAvailability;
    const maxCapacity = (matchingSlot[capacityKey] as number) || 1;
    const bookedCount = ptSessions.filter(
      (s) =>
        s.coach_id === data.coach_id &&
        s.scheduled_date === data.scheduled_date &&
        s.scheduled_time === data.scheduled_time &&
        s.status === "scheduled",
    ).length;

    if (bookedCount >= maxCapacity)
      throw new Error("This slot is fully booked.");

    // 3. Create session
    const { data: newSession, error: sessionError } = await supabase
      .from("pt_sessions")
      .insert({
        package_id: data.package_id,
        coach_id: data.coach_id,
        member_id: data.member_id,
        session_type: data.session_type,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        duration_minutes: data.duration_minutes || 60,
        status: "scheduled",
      })
      .select()
      .single();
    if (sessionError) throw sessionError;

    // 4. Log status
    await supabase.from("session_status_log").insert({
      session_id: newSession.id,
      old_status: null,
      new_status: "scheduled",
      changed_by: data.member_id,
      changed_by_role: "member",
    });

    // 5. Send notifications
    const memberName =
      members.find((m) => m.id === data.member_id)?.name || "Client";
    const coachName =
      members.find((m) => m.id === data.coach_id)?.name || "Coach";
    await Notifications.notifyBookingConfirmation(
      data.member_id,
      data.coach_id,
      newSession.id,
      coachName,
      memberName,
      data.scheduled_date,
      data.scheduled_time,
    );

    await fetchAllData();
    broadcastAlert("Session booked successfully.", "success");
  };

  const bookTrialSession = async (data: {
    coach_id: string;
    member_id: string;
    scheduled_date: string;
    scheduled_time: string;
  }) => {
    // 1. Create a 1-session trial package
    const { data: newPkg, error: pkgError } = await supabase
      .from("pt_packages")
      .insert({
        member_id: data.member_id,
        coach_id: data.coach_id,
        package_type: "trial",
        total_sessions: 1,
        remaining_sessions: 1,
        price_paid: 0,
        payment_confirmed: true,
        starts_at: new Date().toISOString(),
        status: "active",
      })
      .select()
      .single();

    if (pkgError) throw pkgError;

    // 2. Book the session using this package
    await bookPTSession({
      package_id: newPkg.id,
      coach_id: data.coach_id,
      member_id: data.member_id,
      session_type: "trial",
      scheduled_date: data.scheduled_date,
      scheduled_time: data.scheduled_time,
    });
  };

  const adminAddSession = async (data: {
    coach_id: string;
    member_id: string;
    session_type: SessionType;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes?: number;
  }) => {
    // Admin directly creating a session (trial or otherwise). Create a 1-session package on the fly.
    const { data: newPackage, error: pkgError } = await supabase
      .from("pt_packages")
      .insert({
        member_id: data.member_id,
        coach_id: data.coach_id,
        package_type: data.session_type,
        total_sessions: 1,
        remaining_sessions: 1,
        price_paid: 0,
        payment_confirmed: true,
        status: "active",
      })
      .select()
      .single();

    if (pkgError) throw pkgError;

    const { data: newSession, error: sessionError } = await supabase
      .from("pt_sessions")
      .insert({
        package_id: newPackage.id,
        coach_id: data.coach_id,
        member_id: data.member_id,
        session_type: data.session_type,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        duration_minutes: data.duration_minutes || 60,
        status: "scheduled",
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    await fetchAllData();
    broadcastAlert(`Session created for member.`, "success");
  };

  const cancelPTSession = async (sessionId: string) => {
    if (!currentUser) throw new Error("Auth required");
    const session = ptSessions.find((s) => s.id === sessionId);
    if (!session) throw new Error("Session not found.");
    if (session.status !== "scheduled")
      throw new Error("Only scheduled sessions can be cancelled.");

    // Check cancellation window
    const policy = sessionPolicies.find(
      (p) => p.session_type === session.session_type,
    );
    if (policy && currentUser.role === "member") {
      const sessionDateTime = new Date(
        `${session.scheduled_date}T${session.scheduled_time}`,
      );
      const hoursUntil = (sessionDateTime.getTime() - Date.now()) / 3600000;
      if (hoursUntil < policy.cancellation_window_hours) {
        throw new Error(
          `Cancellation must be at least ${policy.cancellation_window_hours} hours before the session.`,
        );
      }
    }

    // Update session status
    await supabase
      .from("pt_sessions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    // Log
    await supabase.from("session_status_log").insert({
      session_id: sessionId,
      old_status: "scheduled",
      new_status: "canceled",
      changed_by: currentUser.id,
      changed_by_role: currentUser.role,
    });

    // Notify
    const memberName =
      members.find((m) => m.id === session.member_id)?.name || "Client";
    const coachName =
      members.find((m) => m.id === session.coach_id)?.name || "Coach";
    await Notifications.notifyCancellation(
      session.member_id,
      session.coach_id,
      session.id,
      coachName,
      memberName,
      session.scheduled_date,
      session.scheduled_time,
      currentUser?.name || "System",
    );

    await fetchAllData();
    broadcastAlert("Session cancelled.", "info");
  };

  const reschedulePTSession = async (
    sessionId: string,
    newDate: string,
    newTime: string,
  ) => {
    if (!currentUser) throw new Error("Auth required");
    const session = ptSessions.find((s) => s.id === sessionId);
    if (!session) throw new Error("Session not found.");
    if (session.status !== "scheduled")
      throw new Error("Only scheduled sessions can be rescheduled.");

    // Check reschedule limits
    const pkg = ptPackages.find((p) => p.id === session.package_id);
    const policy = sessionPolicies.find(
      (p) => p.session_type === session.session_type,
    );
    if (pkg && policy && pkg.reschedules_used >= policy.max_reschedules) {
      throw new Error(
        `Maximum reschedules (${policy.max_reschedules}) reached for this package.`,
      );
    }

    // Mark old session as rescheduled
    await supabase
      .from("pt_sessions")
      .update({ status: "rescheduled", updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    // Log
    await supabase.from("session_status_log").insert({
      session_id: sessionId,
      old_status: "scheduled",
      new_status: "rescheduled",
      changed_by: currentUser.id,
      changed_by_role: currentUser.role,
    });

    // Create new session
    await supabase.from("pt_sessions").insert({
      package_id: session.package_id,
      coach_id: session.coach_id,
      member_id: session.member_id,
      session_type: session.session_type,
      scheduled_date: newDate,
      scheduled_time: newTime,
      duration_minutes: session.duration_minutes,
      status: "scheduled",
    });

    // Increment reschedule count
    if (pkg) {
      await supabase
        .from("pt_packages")
        .update({
          reschedules_used: (pkg.reschedules_used || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pkg.id);
    }

    // Notify
    const memberName =
      members.find((m) => m.id === session.member_id)?.name || "Client";
    const coachName =
      members.find((m) => m.id === session.coach_id)?.name || "Coach";
    await Notifications.notifyReschedule(
      session.member_id,
      session.coach_id,
      sessionId,
      coachName,
      memberName,
      session.scheduled_date,
      `${newDate} at ${newTime}`,
      newTime,
    );

    await fetchAllData();
    broadcastAlert("Session rescheduled.", "success");
  };

  const updateSessionStatus = async (
    sessionId: string,
    status: SessionStatus,
    notes?: string,
  ) => {
    if (!currentUser) throw new Error("Auth required");
    const session = ptSessions.find((s) => s.id === sessionId);
    if (!session) throw new Error("Session not found.");

    await supabase
      .from("pt_sessions")
      .update({
        status,
        notes: notes !== undefined ? notes : session.notes,
        updated_at: new Date().toISOString()
      })
      .eq("id", sessionId);

    // Log
    await supabase.from("session_status_log").insert({
      session_id: sessionId,
      old_status: session.status,
      new_status: status,
      changed_by: currentUser.id,
      changed_by_role: currentUser.role,
    });

    if (status === "canceled") {
      // Fire Push Notification to Member's Smartphone
      await supabase.functions.invoke("send-push-notification", {
        body: {
          userId: session.member_id,
          title: "Session Cancelled",
          message: `Your PT Session on ${session.scheduled_date} at ${session.scheduled_time.slice(0, 5)} was cancelled by the coach.`,
        }
      });
    }

    // Deduct session from package if completed or no_show
    if (status === "completed" || status === "no_show") {
      const pkg = ptPackages.find((p) => p.id === session.package_id);
      if (pkg && pkg.remaining_sessions > 0) {
        const newRemaining = pkg.remaining_sessions - 1;
        await supabase
          .from("pt_packages")
          .update({
            remaining_sessions: newRemaining,
            status: newRemaining <= 0 ? "exhausted" : pkg.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", pkg.id);
      }

      if (status === "no_show") {
        const memberName =
          members.find((m) => m.id === session.member_id)?.name || "Client";
        await Notifications.notifyNoShow(
          session.member_id,
          session.coach_id,
          sessionId,
          memberName,
          session.scheduled_date,
        );
      }
    }

    await fetchAllData();
    broadcastAlert(
      `Session marked as ${status}.`,
      status === "completed" ? "success" : "info",
    );
  };

  const setCoachAvailability = async (data: Omit<CoachAvailability, "id">) => {
    const { error } = await supabase.from("coach_availabilities").upsert(
      {
        coach_id: data.coach_id,
        day_of_week: data.day_of_week,
        specific_date: data.specific_date,
        start_time: data.start_time,
        end_time: data.end_time,
        is_day_off: data.is_day_off,
        max_pt_1on1: data.max_pt_1on1,
        max_partner: data.max_partner,
        max_group: data.max_group,
        max_class: data.max_class,
        max_nutrition: data.max_nutrition,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "coach_id,day_of_week,specific_date,start_time" },
    );
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Availability updated.", "success");
  };

  const deleteCoachAvailability = async (slotId: string) => {
    const { error } = await supabase
      .from("coach_availabilities")
      .delete()
      .eq("id", slotId);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Time slot removed.", "info");
  };

  const updateSessionPolicy = async (
    policyId: string,
    updates: Partial<SessionPolicy>,
  ) => {
    const { error } = await supabase
      .from("session_policies")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", policyId);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Session policy updated.", "success");
  };

  const markNotificationRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
    await fetchAllData();
  };

  const markAllNotificationsRead = async () => {
    if (!currentUser) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", currentUser.id)
      .eq("is_read", false);
    await fetchAllData();
  };

  // ============================================================
  // FINAL FEATURES (Tiers, Transactions, Reviews)
  // ============================================================
  const addMembershipTier = async (
    tier: Omit<MembershipTier, "id" | "created_at">,
  ) => {
    const { error } = await supabase.from("membership_tiers").insert(tier);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert(`Membership tier '${tier.name}' added.`, "success");
  };

  const deleteMembershipTier = async (tierId: string) => {
    const { error } = await supabase
      .from("membership_tiers")
      .delete()
      .eq("id", tierId);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Membership tier removed.", "success");
  };

  const assignMembership = async (memberId: string, tierId: string) => {
    // In a real app we would update the member's profile or active_subscriptions table.
    const tier = membershipTiers.find((t) => t.id === tierId);
    if (!tier) throw new Error("Tier not found");
    const { error } = await supabase
      .from("profiles")
      .update({ membership_tier_id: tier.id })
      .eq("id", memberId);
    if (error) throw error;

    // Log it as a transaction organically
    await supabase.from("financial_transactions").insert({
      amount: tier.price,
      transaction_type: "membership",
      status: "completed",
      description: `Membership Tier: ${tier.name}`,
      member_id: memberId,
    });
    await fetchAllData();
    broadcastAlert(`Assigned ${tier.name} to member successfully.`, "success");
  };

  const addTransaction = async (
    data: Omit<FinancialTransaction, "id" | "created_at">,
  ) => {
    const { error } = await supabase
      .from("financial_transactions")
      .insert(data);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Transaction recorded successfully.", "success");
  };

  // ============================================================
  // FREEZE REQUESTS
  // ============================================================

  const submitFreezeRequest = async (startDate: string, endDate: string, reason: string) => {
    if (!currentUser) throw new Error("Auth required");

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) throw new Error("End date must be after start date.");
    if (diffDays > 30) throw new Error("Maximum freeze duration is 30 days.");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minStart = new Date(today);
    minStart.setDate(minStart.getDate() + 7);
    if (start < minStart) throw new Error("Freeze requests require at least 7 days notice.");

    // Check for overlapping pending/approved requests
    const overlapping = freezeRequests.filter(
      (fr) => fr.member_id === currentUser.id &&
        fr.status !== 'rejected' &&
        new Date(fr.start_date) <= end &&
        new Date(fr.end_date) >= start
    );
    if (overlapping.length > 0) throw new Error("You already have a freeze request for this period.");

    const { error } = await supabase.from("freeze_requests").insert({
      member_id: currentUser.id,
      start_date: startDate,
      end_date: endDate,
      reason: reason || null,
      status: 'pending',
    });

    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Freeze request submitted. Awaiting admin approval.", "success");
  };

  const reviewFreezeRequest = async (requestId: string, status: 'approved' | 'rejected', adminNotes?: string) => {
    if (!currentUser || currentUser.role !== 'admin') throw new Error("Admin access required");

    const { error } = await supabase
      .from("freeze_requests")
      .update({
        status,
        admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) throw error;

    // If approved, suspend the member's membership
    if (status === 'approved') {
      const request = freezeRequests.find(fr => fr.id === requestId);
      if (request) {
        await supabase.from("profiles")
          .update({ membership_status: 'suspended' })
          .eq("id", request.member_id);
      }
    }

    await fetchAllData();
    broadcastAlert(`Freeze request ${status}.`, status === 'approved' ? 'success' : 'info');
  };

  const createInvitation = async (data: Omit<Invitation, "id" | "created_at" | "status" | "member_id">) => {
    if (!currentUser) throw new Error("Auth required");

    if (currentUser.invitationsBalance <= 0) {
      throw new Error("No invitations remaining in account.");
    }

    const { error } = await supabase.from("invitations").insert({
      member_id: currentUser.id,
      guest_name: data.guest_name,
      guest_email: data.guest_email,
      guest_phone: data.guest_phone,
      visit_date: data.visit_date,
      status: "pending"
    });

    if (error) throw error;

    await fetchAllData();
    broadcastAlert(`Guest invitation issued for ${data.guest_name}. Balance updated.`, "success");
  };

  const checkoutPay = async (itemType: "membership" | "package", itemId: string, promoCode?: string) => {
    if (!currentUser) throw new Error("Auth required");

    try {
      broadcastAlert("Processing mock secure payment...", "info");
      
      // Simulate network wait for payment processing
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      if (itemType === "membership") {
        await assignMembership(currentUser.id, itemId);
        
        const tier = membershipTiers.find(t => t.id === itemId);
        if (tier) {
          await addTransaction({
            amount: tier.price,
            transaction_type: "membership",
            status: "completed",
            description: `Mock Payment - ${tier.name} Membership${promoCode ? ` (Promo: ${promoCode})` : ''}`,
            member_id: currentUser.id
          });
        }
        broadcastAlert("Membership successfully purchased! (Mock Payment)", "success");
        
      } else if (itemType === "package") {
        const pkg = packageOfferings.find(p => p.id === itemId);
        if (!pkg) throw new Error("Package not found");
        
        const price = (currentUser?.membershipStatus === 'active' || !pkg.price_outsider)
          ? pkg.price_member
          : pkg.price_outsider;

        await createPackage({
          member_id: currentUser.id,
          coach_id: null,
          package_type: pkg.session_type,
          total_sessions: pkg.total_sessions,
          remaining_sessions: pkg.total_sessions,
          price_paid: price,
          payment_confirmed: true,
          starts_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active"
        });

        await addTransaction({
          amount: price,
          transaction_type: "package",
          status: "completed",
          description: `Mock Payment - ${pkg.name} Package${promoCode ? ` (Promo: ${promoCode})` : ''}`,
          member_id: currentUser.id
        });

        broadcastAlert("Package successfully purchased! (Mock Payment)", "success");
      }
      
      await fetchAllData();
      
    } catch (err: any) {
      console.error(err);
      broadcastAlert(`Checkout error: ${err.message}`, "error");
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!currentUser) throw new Error("Auth required");
    const { error } = await supabase.from("messages").insert({
      sender_id: currentUser.id,
      receiver_id: receiverId,
      content,
    });
    if (error) throw error;
    await fetchAllData();
  };

  const markAsRead = async (messageId: string) => {
    const { error } = await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", messageId);
    if (error) throw error;
    await fetchAllData();
  };

  const signWaiver = async (documentType: string, signature?: string) => {
    if (!currentUser) throw new Error("Auth required");
    const { error } = await supabase.from("legal_agreements").insert({
      member_id: currentUser.id,
      document_type: documentType,
      signature_data: signature || null,
    });
    if (error) throw error;
    await fetchAllData();
  };

  const validatePromoCode = async (code: string): Promise<PromoCode | null> => {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("active", true)
      .single();
    if (error || !data) return null;
    if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
    if (data.usage_limit !== null && data.times_used >= data.usage_limit) return null;
    return data;
  };

  const applyReferral = async (referrerCode: string) => {
    if (!currentUser) throw new Error("Auth required");
    const { data: referrer, error: referrerError } = await supabase
      .from("profiles")
      .select("id")
      .eq("member_code", referrerCode.toUpperCase())
      .single();
    
    if (referrerError || !referrer) throw new Error("Invalid referral code");
    if (referrer.id === currentUser.id) throw new Error("Cannot refer yourself");

    const { error } = await supabase.from("referrals").insert({
      referrer_id: referrer.id,
      referred_id: currentUser.id,
      reward_status: 'pending'
    });
    if (error) {
      if (error.code === '23505') throw new Error("You have already used a referral code");
      throw error;
    }
    broadcastAlert("Referral applied successfully!", "success");
  };

  const addStaffShift = async (data: Omit<StaffShift, 'id' | 'created_at' | 'staff_name'>) => {
    if (!currentUser) throw new Error("Auth required");
    const { error } = await supabase.from("staff_shifts").insert(data);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Staff shift added successfully.", "success");
  };

  const deleteStaffShift = async (id: string) => {
    if (!currentUser) throw new Error("Auth required");
    const { error } = await supabase.from("staff_shifts").delete().eq("id", id);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Staff shift deleted.", "info");
  };

  const punchIn = async () => {
    if (!currentUser) throw new Error("Auth required");
    const { error } = await supabase.from("staff_attendance").insert({
      staff_id: currentUser.id,
      punch_in: new Date().toISOString(),
      status: 'present'
    });
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("You have successfully punched in.", "success");
  };

  const punchOut = async () => {
    if (!currentUser) throw new Error("Auth required");
    
    // Find active punch in
    const activePunch = staffAttendance.find(a => a.staff_id === currentUser.id && !a.punch_out);
    if (!activePunch) {
      broadcastAlert("No active punch-in found.", "warning");
      return;
    }

    const { error } = await supabase.from("staff_attendance")
      .update({ punch_out: new Date().toISOString() })
      .eq("id", activePunch.id);

    if (error) throw error;
    await fetchAllData();
    broadcastAlert("You have successfully punched out.", "success");
  };

  const addContent = async (data: Omit<LibraryContent, 'id' | 'created_at' | 'author_name'>) => {
    if (!currentUser) throw new Error("Auth required");
    const { error } = await supabase.from("library_content").insert({
      ...data,
      author_id: currentUser.id
    });
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Content added to library.", "success");
  };

  const deleteContent = async (id: string) => {
    if (!currentUser) throw new Error("Auth required");
    const { error } = await supabase.from("library_content").delete().eq("id", id);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Content deleted.", "info");
  };

  // Event Functions
  const registerForEvent = async (eventId: string) => {
    if (!currentUser) throw new Error("Auth required");
    const { error } = await supabase.from('event_registrations').insert([
      { event_id: eventId, member_id: currentUser.id }
    ]);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Registered for event.", "success");
  };

  const cancelEventRegistration = async (registrationId: string) => {
    const { error } = await supabase.from('event_registrations').delete().eq('id', registrationId);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Cancelled event registration.", "info");
  };

  const createEvent = async (event: Partial<PlatformEvent>) => {
    if (!currentUser) throw new Error("Auth required");
    const { error } = await supabase.from('events').insert([
      { ...event, created_by: currentUser.id }
    ]);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Event created successfully.", "success");
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert("Event deleted.", "info");
  };


  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <DataContext.Provider
      value={{
        members,
        classes,
        kitchenItems,
        orders,
        maintenanceLogs,
        transactions,
        equipment,
        facilityZones,
        operatingGoals,
        coachReviews,
        settings,
        currentUser,
        loading,
        error,
        systemAlert,
        setSystemAlert,
        setCurrentUser,
        bookClass,
        cancelClass,
        placeOrder,
        updateOrderStatus,
        updateSettings,
        addMaintenanceLog,
        refreshData: fetchAllData,
        addMember,
        deleteMember,
        updateMemberStatus,
        updateMemberRole,
        renewMembership,
        resetUserPassword,
        addCoach,
        addClass,
        registerAttendance,
        broadcastAlert,
        // PT Management
        ptPackages,
        ptSessions,
        coachAvailabilities,
        sessionPolicies,
        notifications: appNotifications,
        createPackage,
        bookPTSession,
        bookTrialSession,
        adminAddSession,
        cancelPTSession,
        reschedulePTSession,
        updateSessionStatus,
        setCoachAvailability,
        deleteCoachAvailability,
        updateSessionPolicy,
        markNotificationRead,
        markAllNotificationsRead,
        confirmPackagePayment,
        // Membership Actions
        membershipTiers,
        addMembershipTier,
        deleteMembershipTier,
        assignMembership,
        addTransaction,
        invitations,
        createInvitation,
        // Nutritionists
        nutritionists,
        nutritionAssessments,
        mealPlans,
        packageOfferings,
        // Attendance
        attendanceLogs,
        // Freeze Requests
        freezeRequests,
        submitFreezeRequest,
        reviewFreezeRequest,
        // Waitlists
        classWaitlists,
        joinWaitlist,
        leaveWaitlist,
        // Workouts
        workouts,
        logWorkout,
        // Messages
        messages,
        sendMessage,
        markAsRead,
        // Waivers
        legalAgreements,
        signWaiver,
        // Promos & Referrals
        promoCodes,
        validatePromoCode,
        applyReferral,
        staffShifts,
        staffAttendance,
        payrollRecords,
        addStaffShift,
        deleteStaffShift,
        punchIn,
        punchOut,
        libraryContent,
        addContent,
        deleteContent,
        events,
        eventRegistrations,
        registerForEvent,
        cancelEventRegistration,
        createEvent,
        deleteEvent
      }}
    >
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
