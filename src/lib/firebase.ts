import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * FirestoreQueryBuilder - A shim that translates Supabase-like query syntax
 * into real Firestore operations to minimize application-wide changes.
 */
class FirestoreQueryBuilder implements PromiseLike<any> {
  private tableName: string;
  private _filters: { field: string; operator: any; value: any }[] = [];
  private _orderByField: string | null = null;
  private _orderDesc: boolean = false;
  private _limitCount: number | null = null;
  private _singleResult: boolean = false;
  private _action: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private _payload: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(_fields: string = "*") { this._action = "select"; return this; }
  insert(data: any) { this._action = "insert"; this._payload = data; return this; }
  update(data: any) { this._action = "update"; this._payload = data; return this; }
  delete() { this._action = "delete"; return this; }
  upsert(data: any) { this._action = "upsert"; this._payload = data; return this; }

  eq(field: string, value: any) { 
    this._filters.push({ field, operator: "==", value }); 
    return this; 
  }
  
  neq(field: string, value: any) { 
    this._filters.push({ field, operator: "!=", value }); 
    return this; 
  }

  match(obj: any) { 
    Object.keys(obj).forEach(k => this.eq(k, obj[k])); 
    return this; 
  }

  order(field: string, { ascending = true } = {}) {
    this._orderByField = field;
    this._orderDesc = !ascending;
    return this;
  }

  limit(n: number) {
    this._limitCount = n;
    return this;
  }

  single() {
    this._singleResult = true;
    return this;
  }

  async execute() {
    try {
      const colRef = collection(db, this.tableName);

      if (this._action === "select") {
        let q = query(colRef);

        // Apply filters
        for (const filter of this._filters) {
          q = query(q, where(filter.field, filter.operator, filter.value));
        }

        // Apply ordering
        if (this._orderByField) {
          q = query(q, orderBy(this._orderByField, this._orderDesc ? "desc" : "asc"));
        }

        // Apply limit
        if (this._limitCount) {
          q = query(q, limit(this._limitCount));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // Special logic for "classes" join mock as seen in existing codebase
        if (this.tableName === "classes") {
           // This is a complex join shim. Currently fetching coaches in a naive way.
           // In production, this data should ideally be materialized or handled properly.
           const coachesSnap = await getDocs(collection(db, "coaches"));
           const coaches = coachesSnap.docs.reduce((acc: any, d) => {
               acc[d.id] = d.data();
               return acc;
           }, {});
           
           for (let item of data as any[]) {
               const coachId = item.coach_id;
               if (coachId && coaches[coachId]) {
                   item.coach = { profiles: { full_name: coaches[coachId].full_name || "Unknown Coach" } };
               }
           }
        }

        if (this._singleResult) {
          return { data: data[0] || null, error: null };
        }
        return { data, error: null };
      }

      if (this._action === "insert") {
        const docRef = await addDoc(colRef, {
          ...this._payload,
          created_at: new Date().toISOString()
        });
        return { data: { id: docRef.id, ...this._payload }, error: null };
      }

      if (this._action === "update") {
        // Update requires a filter (usually id)
        const idFilter = this._filters.find(f => f.field === "id" && f.operator === "==");
        if (!idFilter) throw new Error("Update requires an ID filter in this shim.");

        const docRef = doc(db, this.tableName, idFilter.value);
        await updateDoc(docRef, this._payload);
        return { data: this._payload, error: null };
      }

      if (this._action === "delete") {
        const idFilter = this._filters.find(f => f.field === "id" && f.operator === "==");
        if (!idFilter) throw new Error("Delete requires an ID filter in this shim.");

        const docRef = doc(db, this.tableName, idFilter.value);
        await deleteDoc(docRef);
        return { data: null, error: null };
      }

      if (this._action === "upsert") {
        const id = this._payload.id;
        if (!id) throw new Error("Upsert requires an ID in the payload.");
        const docRef = doc(db, this.tableName, id);
        await setDoc(docRef, this._payload, { merge: true });
        return { data: this._payload, error: null };
      }

    } catch (error: any) {
      console.error(`Firebase Shim Error [${this.tableName}]:`, error);
      return { data: null, error };
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
 * Main SDK Export
 */
export const firebase = {
  from: (table: string) => new FirestoreQueryBuilder(table),
  auth: {
    signInWithPassword: async ({ email, password }: any) => {
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        return { data: { user: res.user }, error: null };
      } catch (error: any) {
        console.error("Firebase Auth Error [signIn]:", error.message);
        return { data: { user: null }, error };
      }
    },
    signUp: async ({ email, password, options }: any) => {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        
        // Trigger verification email immediately
        await sendEmailVerification(res.user);

        // Create profile if metadata provided
        if (options?.data) {
           await setDoc(doc(db, "profiles", res.user.uid), {
               email,
               ...options.data,
               created_at: new Date().toISOString()
           });
        }
        return { data: { user: res.user }, error: null };
      } catch (error: any) {
        return { data: { user: null }, error };
      }
    },
    signOut: async () => {
      try {
        await signOut(auth);
        return { error: null };
      } catch (error: any) {
        return { error };
      }
    },
    getSession: async () => {
      return { data: { session: auth.currentUser }, error: null };
    },
    onAuthStateChange: (callback: any) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        callback(user ? "SIGNED_IN" : "SIGNED_OUT", user ? { email: user.email, ...user } : null);
      });
      return { data: { subscription: { unsubscribe } } };
    },
    resetPasswordForEmail: async (email: string, _options?: any) => {
      try {
        await sendPasswordResetEmail(auth, email);
        return { data: {}, error: null };
      } catch (error: any) {
        console.error("Firebase Auth Error [resetPassword]:", error.message);
        return { data: null, error };
      }
    },
    signInWithOAuth: async ({ provider }: { provider: string }) => {
      try {
        if (provider !== "google") {
          throw new Error(`Provider ${provider} not supported by this shim.`);
        }
        
        const googleProvider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, googleProvider);
        
        // Auto-profile creation if it doesn't exist
        const profileRef = doc(db, "profiles", res.user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (!profileSnap.exists()) {
          await setDoc(profileRef, {
            email: res.user.email,
            full_name: res.user.displayName || "Google User",
            avatar_url: res.user.photoURL,
            role: "member",
            membership_tier: "Standard",
            membership_status: "pending",
            created_at: new Date().toISOString()
          });
        }
        
        return { data: { user: res.user }, error: null };
      } catch (error: any) {
        console.error("Firebase Auth Error [OAuth]:", error.message);
        return { data: null, error };
      }
    },
    verifyOtp: async ({ email, token, type }: any) => {
        // Firebase doesn't have a direct 'verifyOtp' for email recovery like Supabase.
        // This is a placeholder since real Firebase usually uses action codes from links.
        // For a true OTP flow in Firebase, one would usually use a custom backend or Phone Auth.
        console.warn("verifyOtp called - Firebase Auth usually uses action links for email recovery.");
        return { data: {}, error: null };
    },
    resend: async (_opts: any) => {
      try {
        if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser);
            return { data: {}, error: null };
        }
        throw new Error("Activation identity not found. Please sign in again.");
      } catch (error: any) {
        console.error("Firebase Auth Error [resend]:", error.message);
        return { data: null, error };
      }
    },
    updateUser: async (data: any) => {
       try {
           if (auth.currentUser) {
               await updateProfile(auth.currentUser, data);
               return { data: { user: auth.currentUser }, error: null };
           }
           throw new Error("No current user");
       } catch (error: any) {
           return { data: null, error };
       }
    }
  }
};

// Alias to maintain compatibility with existing context files
export const supabase = firebase;
