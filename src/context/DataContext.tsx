import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// --- Interfaces ---

export interface Member {
  id: string; // UUID from Supabase
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

export interface IoTZone {
  id: string;
  name: string;
  temp: number;
  lights: number;
  audio_volume: number;
  occupancy: number;
  max_capacity: number;
}

// --- Context ---

interface DataContextType {
  members: Member[];
  classes: ClassSession[];
  kitchenItems: KitchenItem[];
  orders: KitchenOrder[];
  iotZones: IoTZone[];
  currentUser: Member | null;
  loading: boolean;
  error: string | null;
  setCurrentUser: (user: Member | null) => void;
  bookClass: (classId: string) => Promise<void>;
  cancelClass: (classId: string) => Promise<void>;
  placeOrder: (items: any, totalPrice: number) => Promise<void>;
  updateIoT: (zoneId: string, updates: Partial<IoTZone>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: KitchenOrder['status']) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>([]);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [iotZones, setIotZones] = useState<IoTZone[]>([]);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      const [
        { data: profilesData },
        { data: classesData },
        { data: inventoryData },
        { data: zonesData },
        { data: bookingsData },
        { data: ordersData }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('classes').select('*, coach:coaches(profiles(full_name))'),
        supabase.from('kitchen_inventory').select('*'),
        supabase.from('facility_zones').select('*'),
        supabase.from('bookings').select('*'),
        supabase.from('kitchen_orders').select('*').order('created_at', { ascending: false })
      ]);

      const mappedMembers: Member[] = profilesData?.map(p => ({
        id: p.id,
        name: p.full_name,
        email: p.email,
        role: p.role,
        avatar: p.avatar_url || 'https://i.pravatar.cc/150',
        strain: p.current_strain,
        recovery: p.current_recovery,
        badges: p.athletic_passport_badges,
        riskStatus: p.risk_status,
        code: p.member_code,
        bookedClasses: bookingsData?.filter(b => b.member_id === p.id).map(b => b.class_id) || []
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

      setIotZones(zonesData?.map(z => ({
        id: z.id,
        name: z.name,
        temp: z.temperature_c,
        lights: z.lighting_percent,
        audio_volume: z.audio_volume_percent,
        occupancy: z.current_occupancy,
        max_capacity: z.max_capacity
      })) || []);

      setOrders(ordersData?.map(o => ({
        id: o.id,
        member_id: o.member_id,
        items: o.items,
        total_price: Number(o.total_price),
        status: o.status,
        created_at: o.created_at
      })) || []);

      // Update current user from members list if logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const found = mappedMembers.find(m => m.id === session.user.id);
        if (found) setCurrentUser(found);
      } else {
        setCurrentUser(null);
      }

    } catch (err: any) {
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

    const zonesSubscription = supabase
      .channel('facility-updates')
      .on(
        'postgres_changes' as any,
        { event: '*', table: 'facility_zones', schema: 'public' },
        () => fetchAllData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(zonesSubscription);
      authListener.unsubscribe();
    };
  }, []);

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

  const updateIoT = async (zoneId: string, updates: Partial<IoTZone>) => {
    const { error } = await supabase.from('facility_zones').update({
      temperature_c: updates.temp,
      lighting_percent: updates.lights,
      audio_volume_percent: updates.audio_volume
    }).eq('id', zoneId);
    if (error) throw error;
    await fetchAllData();
  };

  return (
    <DataContext.Provider value={{
      members,
      classes,
      kitchenItems,
      orders,
      iotZones,
      currentUser,
      loading,
      error,
      setCurrentUser,
      bookClass,
      cancelClass,
      placeOrder,
      updateIoT,
      updateOrderStatus,
      refreshData: fetchAllData
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
