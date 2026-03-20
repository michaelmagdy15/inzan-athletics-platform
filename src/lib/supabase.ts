import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, getDocs, doc, setDoc, addDoc, 
  updateDoc, deleteDoc, query, where, orderBy, limit 
} from 'firebase/firestore';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, sendPasswordResetEmail, onAuthStateChanged 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "dummy",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "dummy",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "dummy",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "dummy",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "dummy",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "dummy"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const mapUser = (u: any) => u ? { ...u, id: u.uid } : null;

// Simple query builder simulator for Supabase -> Firestore
class QueryBuilder implements PromiseLike<any> {
  table: string;
  _action: string | null = null;
  _data: any = null;
  _eq: any[] = [];
  _order: any[] = [];
  _limit: number | null = null;
  _single: boolean = false;

  constructor(table: string) {
    this.table = table;
  }
  
  select(fields: string | null = null) { this._action = 'select'; return this; }
  insert(data: any) { this._action = 'insert'; this._data = data; return this; }
  update(data: any) { this._action = 'update'; this._data = data; return this; }
  delete() { this._action = 'delete'; return this; }
  upsert(data: any, opts?: any) { this._action = 'upsert'; this._data = data; return this; }
  
  eq(field: string, value: any) { this._eq.push({ field, value }); return this; }
  match(obj: any) { Object.keys(obj).forEach(k => this.eq(k, obj[k])); return this; }
  neq(field: string, value: any) { return this; /* simplified for proxy */ }
  
  order(field: string, opts?: any) { this._order.push({ field, opts }); return this; }
  limit(n: number) { this._limit = n; return this; }
  single() { this._single = true; return this; }

  async execute(): Promise<any> {
    try {
      if (this._action === 'select') {
        let q: any = collection(db, this.table);
        for (let cond of this._eq) {
            q = query(q, where(cond.field, '==', cond.value));
        }
        for (let ord of this._order) {
            q = query(q, orderBy(ord.field, ord.opts?.ascending ? 'asc' : 'desc'));
        }
        if (this._limit) q = query(q, limit(this._limit));
        
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        
        if (this._single) return { data: data[0] || null, error: null };
        return { data, error: null };
      }
      
      if (this._action === 'insert') {
        const docRef = await addDoc(collection(db, this.table), this._data);
        return { data: { id: docRef.id, ...this._data }, error: null };
      }

      if (this._action === 'upsert') {
        if (this._data.id) {
           await setDoc(doc(db, this.table, this._data.id), this._data, { merge: true });
           return { data: this._data, error: null };
        } else {
           const docRef = await addDoc(collection(db, this.table), this._data);
           return { data: { id: docRef.id, ...this._data }, error: null };
        }
      }
      
      if (this._action === 'update' || this._action === 'delete') {
        const idCond = this._eq.find(c => c.field === 'id');
        if (!idCond) throw new Error("Update/Delete requires .eq('id', value)");
        
        const ref = doc(db, this.table, idCond.value);
        if (this._action === 'update') {
            await updateDoc(ref, this._data);
            return { data: this._data, error: null };
        } else {
            await deleteDoc(ref);
            return { data: null, error: null };
        }
      }
    } catch (e) {
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

export const supabase = {
  from: (table: string) => new QueryBuilder(table),
  functions: {
    invoke: async (name: string, opts?: any) => ({ data: {}, error: null })
  },
  auth: {
    signInWithPassword: async ({ email, password }: any) => {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return { data: { user: mapUser(cred.user) }, error: null };
      } catch (e) { return { error: e }; }
    },
    signUp: async ({ email, password, options }: any) => {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (options?.data) {
           await setDoc(doc(db, 'profiles', cred.user.uid), {
               id: cred.user.uid,
               ...options.data,
               role: 'member',
               email
           });
        }
        return { data: { user: mapUser(cred.user) }, error: null };
      } catch (e) { return { error: e }; }
    },
    signOut: async () => {
      await signOut(auth);
      return { error: null };
    },
    getSession: async () => {
      return { data: { session: { user: mapUser(auth.currentUser) } }, error: null };
    },
    onAuthStateChange: (cb: any) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        cb(user ? 'SIGNED_IN' : 'SIGNED_OUT', { user: mapUser(user) });
      });
      return { data: { subscription: { unsubscribe } } };
    },
    resetPasswordForEmail: async (email: string, opts?: any) => {
      try {
        await sendPasswordResetEmail(auth, email);
        return { data: {}, error: null };
      } catch (e) { return { error: e }; }
    },
    resend: async (opts?: any) => ({ data: {}, error: null }),
    verifyOtp: async (opts?: any) => ({ data: {}, error: null }),
    updateUser: async (opts?: any) => ({ data: {}, error: null })
  }
};
