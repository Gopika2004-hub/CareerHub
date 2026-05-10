import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
const TOKEN_KEY = 'ch_auth_token';

function buildUserObj(data, setUserState) {
  return {
    id: data.id,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    emailAddresses: [{ emailAddress: data.email, id: 'primary' }],
    imageUrl: data.imageUrl || null,
    unsafeMetadata: {
      role: data.role || '',
      company: data.company || '',
      mobile: data.mobile || '',
    },
    phoneNumbers: [],
    username: data.email,
    update: async (params) => {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch('/api/auth/update', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const result = await res.json();
      if (result.success && setUserState) {
        setUserState(prev => prev ? {
          ...prev,
          unsafeMetadata: { ...prev.unsafeMetadata, ...(params.unsafeMetadata || {}) },
          role: params.unsafeMetadata?.role || prev.role,
        } : prev);
      }
      return result;
    },
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const setUserFromData = (data) => setUser(buildUserObj(data, setUser));

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setIsLoaded(true); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.user) setUserFromData(data.user);
        else localStorage.removeItem(TOKEN_KEY);
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoaded(true));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUserFromData(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoaded, isSignedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: null, isLoaded: false, isSignedIn: false };
  return { user: ctx.user, isLoaded: ctx.isLoaded, isSignedIn: ctx.isSignedIn };
}

export function useClerk() {
  const ctx = useContext(AuthContext);
  return {
    signOut: (cb) => {
      ctx?.logout();
      if (typeof cb === 'function') cb();
    },
  };
}

export function useSignIn() {
  const ctx = useContext(AuthContext);
  const pendingRef = useRef(null);

  const signIn = {
    create: async ({ identifier, password, strategy }) => {
      if (strategy === 'reset_password_email_code') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: identifier }),
        });
        const data = await res.json();
        if (!data.success) throw { errors: [{ message: data.error || 'Failed to send reset email' }] };
        pendingRef.current = { email: identifier };
        return { status: 'needs_first_factor' };
      }
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password }),
      });
      const data = await res.json();
      if (!data.success) throw { errors: [{ message: data.error || 'Invalid email or password' }] };
      return { status: 'complete', createdSessionId: { user: data.user, token: data.token } };
    },

    attemptFirstFactor: async ({ strategy, code }) => {
      const email = pendingRef.current?.email;
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!data.success) throw { errors: [{ message: data.error || 'Invalid code' }] };
      pendingRef.current = { ...pendingRef.current, otpToken: data.otpToken };
      return { status: 'needs_new_password' };
    },

    resetPassword: async ({ password }) => {
      const { email, otpToken } = pendingRef.current || {};
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpToken, newPassword: password }),
      });
      const data = await res.json();
      if (!data.success) throw { errors: [{ message: data.error || 'Failed to reset password' }] };
      pendingRef.current = null;
      return { status: 'complete' };
    },
  };

  return {
    isLoaded: true,
    signIn,
    setActive: async ({ session }) => {
      if (session?.user && session?.token) ctx?.login(session.user, session.token);
    },
  };
}

export function useSignUp() {
  const ctx = useContext(AuthContext);
  const pendingRef = useRef(null);

  return {
    isLoaded: true,
    signUp: {
      create: async (data) => {
        pendingRef.current = data;
        return { status: 'missing_requirements' };
      },
      prepareEmailAddressVerification: async () => ({ status: 'pending' }),
      attemptEmailAddressVerification: async () => {
        const d = pendingRef.current;
        if (!d) throw { errors: [{ message: 'Registration data missing' }] };
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: d.firstName || '',
            email: d.emailAddress,
            password: d.password,
            role: d.unsafeMetadata?.role || 'candidate',
            company: d.unsafeMetadata?.company || '',
            mobile: d.unsafeMetadata?.mobile || '',
          }),
        });
        const result = await res.json();
        if (!result.success) throw { errors: [{ message: result.error || 'Registration failed' }] };
        pendingRef.current = null;
        return {
          status: 'complete',
          createdSessionId: { user: result.user, token: result.token },
          createdUserId: result.user.id,
        };
      },
    },
    setActive: async ({ session }) => {
      if (session?.user && session?.token) ctx?.login(session.user, session.token);
    },
  };
}

export function SignedIn({ children }) {
  const { isSignedIn } = useContext(AuthContext) || {};
  return isSignedIn ? children : null;
}

export function SignedOut({ children }) {
  const { isSignedIn } = useContext(AuthContext) || {};
  return !isSignedIn ? children : null;
}

export function UserButton() {
  const { user, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isRecruiter = user?.unsafeMetadata?.role === 'recruiter';
  const initial = (user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'U').charAt(0).toUpperCase();

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:bg-orange-600 transition-colors select-none"
      >
        {initial}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.firstName || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user.emailAddresses?.[0]?.emailAddress}</p>
            </div>
            <button
              onClick={() => { setOpen(false); navigate(isRecruiter ? '/employer/dashboard' : '/candidate/dashboard'); }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              My Profile
            </button>
            <button
              onClick={() => { setOpen(false); logout?.(); navigate('/'); }}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
            >
              Log Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

UserButton.MenuItems = () => null;
UserButton.Link = () => null;
