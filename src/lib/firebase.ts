// Mock Database Simulator replaces Firebase calls to make app functional locally

function uuid() {
  return Math.random().toString(36).substring(2, 11);
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

const mockProfiles = Array.from({ length: 45 }).map((_, i) => ({
  id: `member-${i}`,
  full_name: `Member ${i + 1}`,
  email: `member${i + 1}@example.com`,
  role: i < 3 ? "coach" : "member",
  avatar_url: `https://i.pravatar.cc/150?u=member-${i}`,
  current_strain: Math.floor(Math.random() * 20),
  current_recovery: Math.floor(Math.random() * 80) + 20,
  risk_status: Math.random() > 0.8 ? "high" : "low",
  membership_status: "active",
  member_code: (1000 + i).toString()
}));

// Include the bypass admin profile
mockProfiles.push({
  id: "mock-admin-id",
  full_name: "Mock Admin Bypass",
  email: "michaelmitry13@gmail.com",
  role: "admin",
  avatar_url: "https://i.pravatar.cc/150",
  current_strain: 0,
  current_recovery: 100,
  risk_status: "low",
  membership_status: "active",
  member_code: "0000"
});

const todayStr = new Date().toISOString();

const mockClasses = Array.from({ length: 15 }).map((_, i) => ({
  id: `class-${i}`,
  name: `Class Type ${Math.floor(Math.random() * 5) + 1}`,
  capacity: 25,
  start_time: randomDate(new Date(Date.now() - 86400000 * 2), new Date(Date.now() + 86400000 * 5)),
  duration_minutes: 60,
  tags: ["HIIT", "Strength", "Cardio"].sort(() => 0.5 - Math.random()).slice(0, 1),
  coach_id: `member-${Math.floor(Math.random() * 3)}` // one of the coaches
}));

const mockBookings: any[] = [];
mockClasses.forEach(c => {
  const numBookings = Math.floor(Math.random() * 20);
  for(let j = 0; j < numBookings; j++) {
    mockBookings.push({
      id: uuid(),
      class_id: c.id,
      member_id: mockProfiles[3 + Math.floor(Math.random() * 40)].id // random member
    });
  }
});

const mockAttendance = Array.from({ length: 100 }).map((_, i) => ({
  id: uuid(),
  member_id: mockProfiles[Math.floor(Math.random() * mockProfiles.length)].id,
  checked_in_at: randomDate(new Date(Date.now() - 86400000 * 7), new Date()),
  checked_in_by: "system"
}));

const mockSettings = [{
  id: "0000",
  brand_name: "INZAN Athletics",
  timezone: "UTC+2",
  currency: "EGP",
  notifications_enabled: true,
  mfa_required: true,
  encryption_level: "AES-256",
  active_theme: "default"
}];

const mockTransactions = Array.from({ length: 60 }).map(() => ({
  id: uuid(),
  amount: Math.floor(Math.random() * 1000) + 100,
  transaction_type: ["membership", "kitchen", "pt_session"][Math.floor(Math.random() * 3)],
  status: "completed",
  created_at: randomDate(new Date(Date.now() - 86400000 * 30), new Date())
}));

const mockOrders = Array.from({ length: 30 }).map(() => ({
  id: uuid(),
  member_id: mockProfiles[Math.floor(Math.random() * mockProfiles.length)].id,
  items: [{ id: "item-1", name: "Protein Shake", quantity: 1, price: 150 }],
  total_price: 150,
  status: "completed",
  created_at: randomDate(new Date(Date.now() - 86400000 * 7), new Date())
}));

const mockInventory = [
  { id: "item-1", name: "Protein Shake", quantity: 50, price: 150, category: "Drinks" },
  { id: "item-2", name: "Energy Bar", quantity: 100, price: 50, category: "Snacks" }
];

const mockGoals = [
  { id: "g1", metric_name: "New Members", target_value: 100, current_value: 45 },
  { id: "g2", metric_name: "Monthly Revenue", target_value: 50000, current_value: 15000 }
];

const inMemoryDB: Record<string, any[]> = {
  profiles: mockProfiles,
  classes: mockClasses,
  bookings: mockBookings,
  pt_packages: [],
  pt_sessions: [],
  coach_availabilities: [],
  session_policies: [],
  attendance_logs: mockAttendance,
  freeze_requests: [],
  class_waitlists: [],
  operating_goals: mockGoals,
  financial_transactions: mockTransactions,
  equipment: [],
  facility_zones: [],
  maintenance_logs: [],
  system_settings: mockSettings,
  kitchen_inventory: mockInventory,
  kitchen_orders: mockOrders
};

class MockQueryBuilder implements PromiseLike<any> {
  table: string;
  _action: string | null = null;
  _data: any = null;
  _eq: any[] = [];
  _order: any[] = [];
  _limit: number | null = null;
  _single: boolean = false;
  _neq: any[] = [];

  constructor(table: string) {
    this.table = table;
    if (!inMemoryDB[table]) {
      inMemoryDB[table] = []; // Auto-initialize table if it doesn't exist
    }
  }

  select(fields: string | null = null) { this._action = 'select'; return this; }
  insert(data: any) { this._action = 'insert'; this._data = data; return this; }
  update(data: any) { this._action = 'update'; this._data = data; return this; }
  delete() { this._action = 'delete'; return this; }
  upsert(data: any) { this._action = 'upsert'; this._data = data; return this; }

  eq(field: string, value: any) { this._eq.push({ field, value }); return this; }
  neq(field: string, value: any) { this._neq.push({ field, value }); return this; }
  match(obj: any) { Object.keys(obj).forEach(k => this.eq(k, obj[k])); return this; }

  order(field: string, opts?: any) { this._order.push({ field, opts }); return this; }
  limit(n: number) { this._limit = n; return this; }
  single() { this._single = true; return this; }

  async execute() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));

    let tableData = inMemoryDB[this.table];

    try {
      if (this._action === 'select') {
        let results = [...tableData];
        
        for (let cond of this._eq) {
          results = results.filter(row => row[cond.field] === cond.value);
        }
        for (let cond of this._neq) {
            results = results.filter(row => row[cond.field] !== cond.value);
        }

        for (let ord of this._order) {
           const asc = ord.opts?.ascending !== false;
           results.sort((a, b) => {
             if (a[ord.field] < b[ord.field]) return asc ? -1 : 1;
             if (a[ord.field] > b[ord.field]) return asc ? 1 : -1;
             return 0;
           });
        }

        if (this._limit) {
          results = results.slice(0, this._limit);
        }

        // Extremely hacky relation mock for "classes(coach:coaches(profiles(full_name)))" style fetches
        if (this.table === "classes") {
           results = results.map(c => {
               const coachProfile = inMemoryDB.profiles.find(p => p.id === c.coach_id);
               return { ...c, coach: { profiles: { full_name: coachProfile?.full_name || "Unknown Coach" } } };
           });
        }

        if (this._single) return { data: results[0] || null, error: null };
        return { data: results, error: null };
      }

      if (this._action === 'insert') {
          const newData = { ...this._data };
          if (!newData.id) newData.id = uuid();
          if (!newData.created_at) newData.created_at = new Date().toISOString();
          inMemoryDB[this.table].push(newData);
          return { data: newData, error: null };
      }

      if (this._action === 'update' || this._action === 'delete') {
          let rowsToUpdateIndices = [];
          for (let i = 0; i < tableData.length; i++) {
              let match = true;
              for (let cond of this._eq) {
                  if (tableData[i][cond.field] !== cond.value) {
                      match = false; break;
                  }
              }
              for (let cond of this._neq) {
                  if (tableData[i][cond.field] === cond.value) {
                      match = false; break;
                  }
              }
              if (match) rowsToUpdateIndices.push(i);
          }

          if (this._action === 'update') {
              for (let idx of rowsToUpdateIndices) {
                  tableData[idx] = { ...tableData[idx], ...this._data };
              }
              return { data: tableData[rowsToUpdateIndices[0]] || null, error: null };
          } else {
              // delete (go backward to preserve indices)
              for (let i = rowsToUpdateIndices.length - 1; i >= 0; i--) {
                  tableData.splice(rowsToUpdateIndices[i], 1);
              }
              return { data: null, error: null };
          }
      }

    } catch (e: any) {
        console.error(`MockDB Error table ${this.table}:`, e);
        return { data: null, error: e };
    }

    return { data: null, error: null };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const firebase = {
  from: (table: string) => new MockQueryBuilder(table),
  auth: {
    signInWithPassword: async () => ({ data: { user: { id: "mock-admin-id" } }, error: null }),
    signUp: async () => ({ data: {}, error: null }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    resetPasswordForEmail: async () => ({ data: {}, error: null }),
    resend: async () => ({ data: {}, error: null }),
    verifyOtp: async () => ({ data: {}, error: null }),
  }
};

export const supabase = firebase;
