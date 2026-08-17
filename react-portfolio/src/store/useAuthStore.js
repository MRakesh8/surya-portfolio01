import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const AUTH_STORAGE_KEY = 'scrollz_admin_auth';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  // Initialize the auth state by checking localStorage and Supabase with safety timeout
  initializeAuth: () => {
    // Check local storage fallback first for instant restoration
    try {
      const savedUserJson = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUserJson) {
        const savedUser = JSON.parse(savedUserJson);
        if (savedUser && savedUser.email) {
          set({ user: savedUser, loading: false });
        }
      }
    } catch(e) {}

    // Safety timeout: Ensure loading resolves to false within 1s
    const timer = setTimeout(() => {
      if (get().loading) {
        set({ loading: false });
      }
    }, 1000);

    // Get initial Supabase session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        clearTimeout(timer);
        if (!error && session?.user) {
          try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session.user)); } catch(e){}
          set({ user: session.user, loading: false });
        } else if (!get().user) {
          set({ loading: false });
        }
      })
      .catch(() => {
        clearTimeout(timer);
        if (!get().user) set({ loading: false });
      });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session.user)); } catch(e){}
        set({ user: session.user, loading: false });
      }
    });

    return subscription;
  },

  signIn: async (email, password) => {
    if (!email || !email.trim()) {
      throw new Error('Email is required.');
    }
    if (!password) {
      throw new Error('Password is required.');
    }
    const cleanEmail = email.trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });
    if (error) throw error;
    if (data?.user) {
      try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user)); } catch(e){}
      set({ user: data.user, loading: false });
      return data;
    }
    throw new Error('Authentication failed. Please check your credentials.');
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch(e) {}
    try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch(e){}
    set({ user: null, loading: false });
  },
}));

export default useAuthStore;
