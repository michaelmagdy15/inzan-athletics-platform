import * as Notifications from "../lib/NotificationService";

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
    day_of_week: number | null;
    specific_date: string | null;
    start_time: string;
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
