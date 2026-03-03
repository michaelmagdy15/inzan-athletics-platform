import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as Notifications from '../lib/NotificationService';

// --- Interfaces ---

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin' | 'coach';
  avatar: string;
  strain: number;
  recovery: number;
  badges: Badge[];
  riskStatus: 'low' | 'medium' | 'high';
  code: string;
  bookedClasses: string[];
  membershipExpiry: string | null;
  membershipStatus: 'active' | 'suspended' | 'expired' | 'pending';
  lastAttendance: string | null;
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
  status: 'pending' | 'preparing' | 'ready' | 'picked_up';
  created_at: string;
}

export interface MaintenanceLog {
  id: string;
  asset_name: string;
  description: string;
  status: 'completed' | 'in_progress' | 'scheduled';
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
}

// --- PT Management Interfaces ---

export type SessionType = 'pt_1on1' | 'partner' | 'group' | 'class' | 'nutrition';
export type SessionStatus = 'scheduled' | 'completed' | 'no_show' | 'rescheduled' | 'canceled';
export type PackageStatus = 'active' | 'expired' | 'exhausted' | 'cancelled';

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  pt_1on1: 'Personal Training (1-on-1)',
  partner: 'Partner Session',
  group: 'Small Group (3-5)',
  class: 'Class',
  nutrition: 'Nutrition Consultation',
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
  day_of_week: number; // 0=Sun, 6=Sat
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

// --- Context Type ---

interface DataContextType {
  members: Member[];
  classes: ClassSession[];
  kitchenItems: KitchenItem[];
  orders: KitchenOrder[];
  maintenanceLogs: MaintenanceLog[];
  settings: SystemSettings;
  currentUser: Member | null;
  loading: boolean;
  error: string | null;
  systemAlert: { message: string; type: 'info' | 'warning' | 'error' | 'success' } | null;
  setSystemAlert: (alert: { message: string; type: 'info' | 'warning' | 'error' | 'success' } | null) => void;
  setCurrentUser: (user: Member | null) => void;
  bookClass: (classId: string) => Promise<void>;
  cancelClass: (classId: string) => Promise<void>;
  placeOrder: (items: any, totalPrice: number) => Promise<void>;
  updateOrderStatus: (orderId: string, status: KitchenOrder['status']) => Promise<void>;
  updateSettings: (updates: Partial<SystemSettings>) => Promise<void>;
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id' | 'created_at'>) => Promise<void>;
  refreshData: () => Promise<void>;
  addMember: (data: Partial<Member>) => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;
  updateMemberStatus: (memberId: string, status: Member['membershipStatus']) => Promise<void>;
  renewMembership: (memberId: string) => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  addCoach: (data: Partial<Member>) => Promise<void>;
  addClass: (data: any) => Promise<void>;
  registerAttendance: (memberCode: string) => Promise<void>;
  broadcastAlert: (message: string, type: 'info' | 'warning' | 'error' | 'success') => void;
  // PT Management
  ptPackages: PTPackage[];
  ptSessions: PTSession[];
  coachAvailabilities: CoachAvailability[];
  sessionPolicies: SessionPolicy[];
  notifications: AppNotification[];
  createPackage: (data: Omit<PTPackage, 'id' | 'created_at' | 'member_name' | 'coach_name' | 'reschedules_used'>) => Promise<void>;
  bookPTSession: (data: { package_id: string; coach_id: string; member_id: string; session_type: SessionType; scheduled_date: string; scheduled_time: string; duration_minutes?: number }) => Promise<void>;
  cancelPTSession: (sessionId: string) => Promise<void>;
  reschedulePTSession: (sessionId: string, newDate: string, newTime: string) => Promise<void>;
  updateSessionStatus: (sessionId: string, status: SessionStatus) => Promise<void>;
  setCoachAvailability: (data: Omit<CoachAvailability, 'id'>) => Promise<void>;
  deleteCoachAvailability: (slotId: string) => Promise<void>;
  updateSessionPolicy: (policyId: string, updates: Partial<SessionPolicy>) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  confirmPackagePayment: (packageId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>([]);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    brandName: 'INZAN Athletics',
    timezone: 'UTC+2 (Cairo)',
    currency: 'EGP',
    notificationsEnabled: true,
    mfaRequired: true,
    encryptionLevel: 'AES-256'
  });

  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemAlert, setSystemAlert] = useState<{ message: string; type: 'info' | 'warning' | 'error' | 'success' } | null>(null);

  // PT Management state
  const [ptPackages, setPtPackages] = useState<PTPackage[]>([]);
  const [ptSessions, setPtSessions] = useState<PTSession[]>([]);
  const [coachAvailabilities, setCoachAvailabilities] = useState<CoachAvailability[]>([]);
  const [sessionPolicies, setSessionPolicies] = useState<SessionPolicy[]>([]);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);

  const broadcastAlert = (message: string, type: 'info' | 'warning' | 'error' | 'success') => {
    setSystemAlert({ message, type });
    setTimeout(() => setSystemAlert(null), 5000);
  };

  const updateSettings = async (updates: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    broadcastAlert('System parameters adjusted.', 'success');
  };

  const addMaintenanceLog = async (log: Omit<MaintenanceLog, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('maintenance_logs').insert(log);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert(`Maintenance event logged for ${log.asset_name}.`, 'success');
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
        { data: notificationsData }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('classes').select('*, coach:coaches(profiles(full_name))'),
        supabase.from('kitchen_inventory').select('*'),
        supabase.from('bookings').select('*'),
        supabase.from('kitchen_orders').select('*').order('created_at', { ascending: false }),
        supabase.from('maintenance_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('pt_packages').select('*').order('created_at', { ascending: false }),
        supabase.from('pt_sessions').select('*').order('scheduled_date', { ascending: true }),
        supabase.from('coach_availabilities').select('*').order('day_of_week', { ascending: true }),
        supabase.from('session_policies').select('*'),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      const mappedMembers: Member[] = profilesData?.map(p => ({
        id: p.id,
        name: p.full_name,
        email: p.email,
        role: p.role,
        avatar: p.avatar_url || `https://i.pravatar.cc/150?u=${p.id}`,
        strain: p.current_strain,
        recovery: p.current_recovery,
        badges: p.athletic_passport_badges || [],
        riskStatus: p.risk_status || 'low',
        code: p.member_code || p.id.substring(0, 8).toUpperCase(),
        bookedClasses: bookingsData?.filter(b => b.member_id === p.id).map(b => b.class_id) || [],
        membershipExpiry: p.membership_expiry,
        membershipStatus: p.membership_status || 'active',
        lastAttendance: p.last_attendance || null
      })) || [];

      setMembers(mappedMembers);

      setClasses(classesData?.map(c => ({
        id: c.id,
        title: c.name,
        trainer: c.coach?.profiles?.full_name || 'Coach',
        time: new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: `${c.duration_minutes} Mins`,
        spots_left: c.capacity - (bookingsData?.filter(b => b.class_id === c.id).length || 0),
        total_spots: c.capacity,
        date: new Date(c.start_time).toLocaleDateString(),
        watermark: c.tags?.[0]?.toUpperCase() || 'GENERAL',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
        tags: c.tags || []
      })) || []);

      setKitchenItems(inventoryData?.map(i => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        reorder_threshold: i.reorder_threshold,
        unit: i.unit,
        category: i.category,
        price: Number(i.price) || 0,
        description: i.description,
        image_url: i.image_url
      })) || []);

      setOrders(ordersData?.map(o => ({
        id: o.id,
        member_id: o.member_id,
        items: o.items,
        total_price: Number(o.total_price),
        status: o.status,
        created_at: o.created_at
      })) || []);

      setMaintenanceLogs(maintenanceData || []);

      // PT Data
      const memberLookup = new Map(mappedMembers.map(m => [m.id, m.name]));
      setPtPackages((packagesData || []).map(p => ({
        ...p,
        price_paid: Number(p.price_paid),
        member_name: memberLookup.get(p.member_id) || 'Unknown',
        coach_name: memberLookup.get(p.coach_id) || 'Any Coach',
      })));

      setPtSessions((sessionsData || []).map(s => ({
        ...s,
        member_name: memberLookup.get(s.member_id) || 'Unknown',
        coach_name: memberLookup.get(s.coach_id) || 'Unknown',
      })));

      setCoachAvailabilities(availabilityData || []);
      setSessionPolicies(policiesData || []);
      setAppNotifications(notificationsData || []);

      // Auth
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const found = mappedMembers.find(m => m.id === session.user.id);
        if (found) setCurrentUser(found);
      } else {
        setCurrentUser(null);
      }

    } catch (err: any) {
      console.error('Data Fetch Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(() => {
      fetchAllData();
    });
    return () => {
      authListener.unsubscribe();
    };
  }, []);

  // ============================================================
  // EXISTING CRUD
  // ============================================================
  const bookClass = async (classId: string) => {
    if (!currentUser) throw new Error('Auth required');
    const { error } = await supabase.from('bookings').insert({
      member_id: currentUser.id,
      class_id: classId
    });
    if (error) throw error;
    await fetchAllData();
  };

  const cancelClass = async (classId: string) => {
    if (!currentUser) throw new Error('Auth required');
    const { error } = await supabase.from('bookings').delete().match({
      member_id: currentUser.id,
      class_id: classId
    });
    if (error) throw error;
    await fetchAllData();
  };

  const placeOrder = async (items: any, totalPrice: number) => {
    if (!currentUser) throw new Error('Auth required');
    const { error } = await supabase.from('kitchen_orders').insert({
      member_id: currentUser.id,
      items,
      total_price: totalPrice,
      status: 'pending'
    });
    if (error) throw error;
    await fetchAllData();
  };

  const updateOrderStatus = async (orderId: string, status: KitchenOrder['status']) => {
    const { error } = await supabase.from('kitchen_orders').update({ status }).eq('id', orderId);
    if (error) throw error;
    await fetchAllData();
  };

  const addMember = async (data: Partial<Member>) => {
    const { error } = await supabase.from('profiles').insert({
      id: crypto.randomUUID(),
      full_name: data.name,
      email: data.email,
      role: 'member',
      member_code: data.code || Math.random().toString(36).substring(2, 10).toUpperCase(),
      current_strain: 0,
      current_recovery: 100,
      athletic_passport_badges: []
    });
    if (error) throw error;
    await fetchAllData();
    broadcastAlert('New member registered in system.', 'success');
  };

  const deleteMember = async (memberId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', memberId);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert('Member profile deleted.', 'warning');
  };

  const updateMemberStatus = async (memberId: string, status: Member['membershipStatus']) => {
    const { error } = await supabase.from('profiles').update({ membership_status: status }).eq('id', memberId);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert(`Member status updated to ${status}.`, 'info');
  };

  const renewMembership = async (memberId: string) => {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    const { error } = await supabase.from('profiles').update({
      membership_expiry: expiryDate.toISOString(),
      membership_status: 'active'
    }).eq('id', memberId);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert('Membership renewed for 1 cycle.', 'success');
  };

  const resetUserPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    broadcastAlert(`Password reset payload transmitted to ${email}.`, 'success');
  };

  const addCoach = async (data: Partial<Member>) => {
    const { data: profile, error: pError } = await supabase.from('profiles').insert({
      id: crypto.randomUUID(),
      full_name: data.name,
      email: data.email,
      role: 'coach',
      member_code: data.code || `COACH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    }).select().single();

    if (pError) throw pError;

    const { error: cError } = await supabase.from('coaches').insert({
      id: profile.id,
      specialization: 'General Athletics'
    });

    if (cError) throw cError;
    await fetchAllData();
    broadcastAlert('New coach profile created.', 'success');
  };

  const addClass = async (data: any) => {
    const { error } = await supabase.from('classes').insert({
      name: data.title,
      coach_id: data.coach_id,
      start_time: data.start_time,
      duration_minutes: data.duration_minutes,
      capacity: data.capacity,
      tags: data.tags
    });
    if (error) throw error;
    await fetchAllData();
    broadcastAlert('Class session updated in schedule.', 'success');
  };

  const registerAttendance = async (memberCode: string) => {
    const member = members.find(m => m.code === memberCode);
    if (!member) throw new Error('Member not found in system.');

    const { error } = await supabase.from('profiles').update({
      last_attendance: new Date().toISOString()
    }).eq('id', member.id);

    if (error) throw error;
    await fetchAllData();
    broadcastAlert(`Attendance registered for ${member.name}.`, 'success');
  };

  // ============================================================
  // PT MANAGEMENT CRUD
  // ============================================================

  const createPackage = async (data: Omit<PTPackage, 'id' | 'created_at' | 'member_name' | 'coach_name' | 'reschedules_used'>) => {
    const policy = sessionPolicies.find(p => p.session_type === data.package_type);
    const expiresAt = data.expires_at || (policy
      ? new Date(Date.now() + policy.package_validity_days * 86400000).toISOString()
      : new Date(Date.now() + 90 * 86400000).toISOString());

    const { error } = await supabase.from('pt_packages').insert({
      member_id: data.member_id,
      coach_id: data.coach_id,
      package_type: data.package_type,
      total_sessions: data.total_sessions,
      remaining_sessions: data.remaining_sessions || data.total_sessions,
      price_paid: data.price_paid,
      payment_confirmed: data.payment_confirmed,
      starts_at: data.starts_at || new Date().toISOString(),
      expires_at: expiresAt,
      status: data.status || 'active',
    });
    if (error) throw error;
    await fetchAllData();
    broadcastAlert('Package created successfully.', 'success');
  };

  const confirmPackagePayment = async (packageId: string) => {
    const { error } = await supabase.from('pt_packages').update({ payment_confirmed: true }).eq('id', packageId);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert('Payment confirmed — booking unlocked.', 'success');
  };

  const bookPTSession = async (data: {
    package_id: string; coach_id: string; member_id: string;
    session_type: SessionType; scheduled_date: string; scheduled_time: string;
    duration_minutes?: number;
  }) => {
    // 1. Check package balance
    const pkg = ptPackages.find(p => p.id === data.package_id);
    if (!pkg) throw new Error('Package not found.');
    if (!pkg.payment_confirmed) throw new Error('Payment not confirmed. Contact front desk.');
    if (pkg.remaining_sessions <= 0) throw new Error('No sessions remaining in this package.');
    if (pkg.status !== 'active') throw new Error('Package is not active.');
    if (pkg.expires_at && new Date(pkg.expires_at) < new Date()) throw new Error('Package has expired.');

    // 2. Check coach capacity for that slot
    const dayOfWeek = new Date(data.scheduled_date).getDay();
    const coachSlots = coachAvailabilities.filter(
      a => a.coach_id === data.coach_id && a.day_of_week === dayOfWeek && !a.is_day_off
    );
    const matchingSlot = coachSlots.find(s => s.start_time <= data.scheduled_time && s.end_time > data.scheduled_time);
    if (!matchingSlot) throw new Error('Coach is not available at this time.');

    const capacityKey = `max_${data.session_type}` as keyof CoachAvailability;
    const maxCapacity = (matchingSlot[capacityKey] as number) || 1;
    const bookedCount = ptSessions.filter(
      s => s.coach_id === data.coach_id && s.scheduled_date === data.scheduled_date &&
        s.scheduled_time === data.scheduled_time && s.status === 'scheduled'
    ).length;

    if (bookedCount >= maxCapacity) throw new Error('This slot is fully booked.');

    // 3. Create session
    const { data: newSession, error: sessionError } = await supabase.from('pt_sessions').insert({
      package_id: data.package_id,
      coach_id: data.coach_id,
      member_id: data.member_id,
      session_type: data.session_type,
      scheduled_date: data.scheduled_date,
      scheduled_time: data.scheduled_time,
      duration_minutes: data.duration_minutes || 60,
      status: 'scheduled',
    }).select().single();
    if (sessionError) throw sessionError;

    // 4. Log status
    await supabase.from('session_status_log').insert({
      session_id: newSession.id,
      old_status: null,
      new_status: 'scheduled',
      changed_by: data.member_id,
      changed_by_role: 'member',
    });

    // 5. Send notifications
    const memberName = members.find(m => m.id === data.member_id)?.name || 'Client';
    const coachName = members.find(m => m.id === data.coach_id)?.name || 'Coach';
    await Notifications.notifyBookingConfirmation(
      data.member_id, data.coach_id, newSession.id,
      coachName, memberName, data.scheduled_date, data.scheduled_time
    );

    await fetchAllData();
    broadcastAlert('Session booked successfully.', 'success');
  };

  const cancelPTSession = async (sessionId: string) => {
    if (!currentUser) throw new Error('Auth required');
    const session = ptSessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found.');
    if (session.status !== 'scheduled') throw new Error('Only scheduled sessions can be cancelled.');

    // Check cancellation window
    const policy = sessionPolicies.find(p => p.session_type === session.session_type);
    if (policy && currentUser.role === 'member') {
      const sessionDateTime = new Date(`${session.scheduled_date}T${session.scheduled_time}`);
      const hoursUntil = (sessionDateTime.getTime() - Date.now()) / 3600000;
      if (hoursUntil < policy.cancellation_window_hours) {
        throw new Error(`Cancellation must be at least ${policy.cancellation_window_hours} hours before the session.`);
      }
    }

    // Update session status
    await supabase.from('pt_sessions').update({ status: 'canceled', updated_at: new Date().toISOString() }).eq('id', sessionId);

    // Log
    await supabase.from('session_status_log').insert({
      session_id: sessionId,
      old_status: 'scheduled',
      new_status: 'canceled',
      changed_by: currentUser.id,
      changed_by_role: currentUser.role,
    });

    // Notify
    const memberName = members.find(m => m.id === session.member_id)?.name || 'Client';
    const coachName = members.find(m => m.id === session.coach_id)?.name || 'Coach';
    await Notifications.notifyCancellation(
      session.member_id, session.coach_id, sessionId,
      coachName, memberName, session.scheduled_date, session.scheduled_time,
      currentUser.name
    );

    await fetchAllData();
    broadcastAlert('Session cancelled.', 'info');
  };

  const reschedulePTSession = async (sessionId: string, newDate: string, newTime: string) => {
    if (!currentUser) throw new Error('Auth required');
    const session = ptSessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found.');
    if (session.status !== 'scheduled') throw new Error('Only scheduled sessions can be rescheduled.');

    // Check reschedule limits
    const pkg = ptPackages.find(p => p.id === session.package_id);
    const policy = sessionPolicies.find(p => p.session_type === session.session_type);
    if (pkg && policy && pkg.reschedules_used >= policy.max_reschedules) {
      throw new Error(`Maximum reschedules (${policy.max_reschedules}) reached for this package.`);
    }

    // Mark old session as rescheduled
    await supabase.from('pt_sessions').update({ status: 'rescheduled', updated_at: new Date().toISOString() }).eq('id', sessionId);

    // Log
    await supabase.from('session_status_log').insert({
      session_id: sessionId,
      old_status: 'scheduled',
      new_status: 'rescheduled',
      changed_by: currentUser.id,
      changed_by_role: currentUser.role,
    });

    // Create new session
    await supabase.from('pt_sessions').insert({
      package_id: session.package_id,
      coach_id: session.coach_id,
      member_id: session.member_id,
      session_type: session.session_type,
      scheduled_date: newDate,
      scheduled_time: newTime,
      duration_minutes: session.duration_minutes,
      status: 'scheduled',
    });

    // Increment reschedule count
    if (pkg) {
      await supabase.from('pt_packages').update({
        reschedules_used: (pkg.reschedules_used || 0) + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', pkg.id);
    }

    // Notify
    const memberName = members.find(m => m.id === session.member_id)?.name || 'Client';
    const coachName = members.find(m => m.id === session.coach_id)?.name || 'Coach';
    await Notifications.notifyReschedule(
      session.member_id, session.coach_id, sessionId,
      coachName, memberName, session.scheduled_date, `${newDate} at ${newTime}`, newTime
    );

    await fetchAllData();
    broadcastAlert('Session rescheduled.', 'success');
  };

  const updateSessionStatus = async (sessionId: string, status: SessionStatus) => {
    if (!currentUser) throw new Error('Auth required');
    const session = ptSessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found.');

    await supabase.from('pt_sessions').update({ status, updated_at: new Date().toISOString() }).eq('id', sessionId);

    // Log
    await supabase.from('session_status_log').insert({
      session_id: sessionId,
      old_status: session.status,
      new_status: status,
      changed_by: currentUser.id,
      changed_by_role: currentUser.role,
    });

    // Deduct session from package if completed or no_show
    if (status === 'completed' || status === 'no_show') {
      const pkg = ptPackages.find(p => p.id === session.package_id);
      if (pkg && pkg.remaining_sessions > 0) {
        const newRemaining = pkg.remaining_sessions - 1;
        await supabase.from('pt_packages').update({
          remaining_sessions: newRemaining,
          status: newRemaining <= 0 ? 'exhausted' : pkg.status,
          updated_at: new Date().toISOString(),
        }).eq('id', pkg.id);
      }

      if (status === 'no_show') {
        const memberName = members.find(m => m.id === session.member_id)?.name || 'Client';
        await Notifications.notifyNoShow(
          session.member_id, session.coach_id, sessionId,
          memberName, session.scheduled_date
        );
      }
    }

    await fetchAllData();
    broadcastAlert(`Session marked as ${status}.`, status === 'completed' ? 'success' : 'info');
  };

  const setCoachAvailability = async (data: Omit<CoachAvailability, 'id'>) => {
    const { error } = await supabase.from('coach_availabilities').upsert({
      coach_id: data.coach_id,
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      is_day_off: data.is_day_off,
      max_pt_1on1: data.max_pt_1on1,
      max_partner: data.max_partner,
      max_group: data.max_group,
      max_class: data.max_class,
      max_nutrition: data.max_nutrition,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'coach_id,day_of_week,start_time' });
    if (error) throw error;
    await fetchAllData();
    broadcastAlert('Availability updated.', 'success');
  };

  const deleteCoachAvailability = async (slotId: string) => {
    const { error } = await supabase.from('coach_availabilities').delete().eq('id', slotId);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert('Time slot removed.', 'info');
  };

  const updateSessionPolicy = async (policyId: string, updates: Partial<SessionPolicy>) => {
    const { error } = await supabase.from('session_policies').update({
      ...updates,
      updated_at: new Date().toISOString(),
    }).eq('id', policyId);
    if (error) throw error;
    await fetchAllData();
    broadcastAlert('Session policy updated.', 'success');
  };

  const markNotificationRead = async (notificationId: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    await fetchAllData();
  };

  const markAllNotificationsRead = async () => {
    if (!currentUser) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', currentUser.id).eq('is_read', false);
    await fetchAllData();
  };

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <DataContext.Provider value={{
      members,
      classes,
      kitchenItems,
      orders,
      maintenanceLogs,
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
      cancelPTSession,
      reschedulePTSession,
      updateSessionStatus,
      setCoachAvailability,
      deleteCoachAvailability,
      updateSessionPolicy,
      markNotificationRead,
      markAllNotificationsRead,
      confirmPackagePayment,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
