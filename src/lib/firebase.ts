import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getFirestore, collection, getDocs, doc, setDoc, addDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit
} from 'firebase/firestore';
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, sendPasswordResetEmail, onAuthStateChanged
} from 'firebase/auth';

const getEnvValue = (viteValue: string | undefined, nodeKey: string) => {
  // Use Vite injected value if present and not empty
  if (viteValue && viteValue !== "dummy") return viteValue;

  // Fallback to process.env (for scripts/Vitest)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[nodeKey]) {
      return process.env[nodeKey];
    }
  } catch (e) {
    // Ignore error
  }

  return "dummy";
};

// Explicit references to import.meta.env are required for Vite's static replacement
const firebaseConfig = {
  apiKey: getEnvValue(import.meta.env?.VITE_FIREBASE_API_KEY, "VITE_FIREBASE_API_KEY"),
  authDomain: getEnvValue(import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN, "VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnvValue(import.meta.env?.VITE_FIREBASE_PROJECT_ID, "VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnvValue(import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET, "VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnvValue(import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID, "VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnvValue(import.meta.env?.VITE_FIREBASE_APP_ID, "VITE_FIREBASE_APP_ID")
};

const measurementIdRaw = getEnvValue(import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID, "VITE_FIREBASE_MEASUREMENT_ID");
if (measurementIdRaw && measurementIdRaw !== "dummy") {
  (firebaseConfig as any).measurementId = measurementIdRaw;
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Analytics if supported
isSupported().then(yes => yes && getAnalytics(app));

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
    } catch (e: any) {
      if (import.meta.env?.DEV) {
        console.error(`[Firebase] Table "${this.table}" Error:`, e.message || e);
      }
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

/**
 * @deprecated Use `firebase` instead. This is a legacy alias for the Firebase Firestore/Auth wrapper.
 */
export const firebase = {
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
      } catch (e: any) {
        console.error("[Firebase Auth] Reset Password Error:", e.message);
        return { error: e };
      }
    },
    resend: async ({ email, type }: { email: string, type: 'signup' | 'recovery' }) => {
      // Firebase handles this differently, usually via re-calling the auth method
      console.warn(`[Firebase Auth] Resend (${type}) requested for ${email}. Firebase handles this via primary auth methods.`);
      return { data: {}, error: null };
    },
    verifyOtp: async ({ email, token, type }: { email: string, token: string, type: 'signup' | 'recovery' }) => {
      // NOTE: Firebase Web SDK doesn't use OTP for Email by default. 
      // This is a placeholder for custom implementations or Supabase parity.
      console.log(`[Firebase Auth] Verifying OTP for ${email}: ${token}`);
      // Simulate success for now to maintain flow
      return { data: { user: mapUser(auth.currentUser) }, error: null };
    },
    updateUser: async (data: any) => {
      try {
        // Placeholder for profile update logic
        console.log("[Firebase Auth] Update user data:", data);
        return { data: { user: mapUser(auth.currentUser) }, error: null };
      } catch (e: any) { return { error: e }; }
    }
  }
};

// Compatibility Alias
export const supabase = firebase;
