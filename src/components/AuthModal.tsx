import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ADMIN_USERS } from '../data/initialData';
import { 
  User, 
  LogIn, 
  Check, 
  X, 
  ShieldCheck, 
  ArrowRight, 
  LogOut, 
  Lock, 
  Sparkles,
  KeyRound,
  Key,
  Mail,
  RotateCcw,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';
import { 
  isPasswordConfigured, 
  verifyAdminPassword, 
  updateAdminPassword, 
  clearAdminPassword 
} from '../lib/authCrypto';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  onOpenChangePassword?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onOpenChangePassword,
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'guest'>('admin');
  const [selectedAdmin, setSelectedAdmin] = useState<UserProfile>(ADMIN_USERS[0]);
  
  // Password setup / input states
  const [hasPasswordSet, setHasPasswordSet] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Guest login state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subscribeToUpdates, setSubscribeToUpdates] = useState<boolean>(true);
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check password configuration status on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setAdminPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Check client and server status
      const clientConfigured = isPasswordConfigured();
      setHasPasswordSet(clientConfigured);

      fetch('/api/auth/status')
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.isPasswordConfigured === 'boolean') {
            setHasPasswordSet(data.isPasswordConfigured);
          }
        })
        .catch(() => {
          // fallback to client
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Direct login without password (available when no password is set)
  const handleDirectAdminLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      let loggedUser = selectedAdmin;
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: selectedAdmin.email })
        });
        const data = await res.json();
        if (res.ok && data.user) {
          loggedUser = data.user;
        }
      } catch (err) {
        // fallback
      }

      onUserChange(loggedUser);
      setSuccessMsg(`Welcome, Administrator ${loggedUser.name}!`);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (e) {
      setErrorMsg('Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  // First-time administrator password setup + sign in
  const handleSetPasswordAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!newPassword.trim()) {
      setErrorMsg('Please enter a password.');
      setIsLoading(false);
      return;
    }

    if (newPassword.trim().length < 4) {
      setErrorMsg('Password should be at least 4 characters long.');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your confirmation.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Save in client WebCrypto storage
      const result = await updateAdminPassword(newPassword.trim());
      if (!result.success) {
        setErrorMsg(result.error || 'Failed to save password.');
        setIsLoading(false);
        return;
      }

      // 2. Sync to server backend
      let loggedUser = selectedAdmin;
      try {
        const res = await fetch('/api/auth/set-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            password: newPassword.trim(),
            adminEmail: selectedAdmin.email 
          })
        });
        const data = await res.json();
        if (res.ok && data.user) {
          loggedUser = data.user;
        }
      } catch (err) {
        // static fallback
      }

      setHasPasswordSet(true);
      onUserChange(loggedUser);
      setSuccessMsg(`Password successfully created! Welcome, Administrator ${loggedUser.name}!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred setting your password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Login with existing password
  const handleExistingPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (!adminPassword.trim()) {
      setErrorMsg('Please enter your administrator password.');
      setIsLoading(false);
      return;
    }

    try {
      const isValid = await verifyAdminPassword(adminPassword);
      let serverValid = false;
      let loggedUser = selectedAdmin;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: selectedAdmin.email, 
            password: adminPassword 
          })
        });
        const data = await res.json();
        if (res.ok && data.user) {
          serverValid = true;
          loggedUser = data.user;
        }
      } catch (e) {
        // fallback
      }

      if (isValid || serverValid) {
        onUserChange(loggedUser);
        setSuccessMsg(`Welcome back, Administrator ${loggedUser.name}!`);
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setErrorMsg('Incorrect password. If needed, you can click "Reset Password" below to set a new one.');
      }
    } catch (err) {
      setErrorMsg('Authentication error. Please try again or reset.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password state
  const handleResetPassword = async () => {
    setIsLoading(true);
    await clearAdminPassword();
    setHasPasswordSet(false);
    setAdminPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('Password has been cleared. You can now set a new password or sign in directly.');
    setIsLoading(false);
  };

  // Guest login submission with subscription checkbox
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let loggedInUser: UserProfile | null = null;
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: email.trim(), 
            name: name.trim(), 
            subscribeToEmails: subscribeToUpdates 
          })
        });
        const data = await res.json();
        if (data.user) {
          loggedInUser = data.user;
        }
      } catch (networkErr) {
        // Fallback for static hosting / GitHub Pages
      }

      if (!loggedInUser) {
        loggedInUser = {
          id: `guest_${Date.now()}`,
          name: name.trim() || (email ? email.split('@')[0] : 'Guest Follower'),
          email: email.trim().toLowerCase() || 'guest@example.com',
          role: 'friend_follower',
          roleLabel: 'Friend / Follower',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'guest')}`,
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          isAdmin: false
        };
      }

      // Also ensure subscription is registered if checked
      if (subscribeToUpdates && email.trim()) {
        try {
          await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.trim(),
              name: name.trim(),
              relationshipNote: 'Account setup subscriber'
            })
          });
        } catch (e) {
          // ignore
        }
      }

      onUserChange(loggedInUser);
      setSuccessMsg(
        subscribeToUpdates 
          ? `Welcome, ${loggedInUser.name}! You are logged in and subscribed for email alerts.`
          : `Welcome, ${loggedInUser.name}! You are now logged in to leave comments.`
      );
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    onUserChange(null);
    onClose();
  };

  return (
    <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-stone-300 rounded-3xl shadow-2xl overflow-hidden text-stone-800 space-y-0 my-8">
        
        {/* Header */}
        <div className="p-6 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-sm">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Account Sign In
              </h2>
              <p className="text-xs text-stone-500">
                Expedition Administrator (Joannie & Barton) or Guest Access
              </p>
            </div>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Current Active Account Banner */}
        {currentUser && (
          <div className="px-6 py-3.5 bg-blue-50/90 border-b border-blue-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-blue-900/30 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{currentUser.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    currentUser.isAdmin 
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300' 
                      : 'bg-blue-100 text-blue-950 border-blue-300'
                  }`}>
                    {currentUser.isAdmin ? 'Admin (Full Access)' : 'Guest (Comments)'}
                  </span>
                </div>
                <p className="text-xs text-stone-600">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentUser.isAdmin && onOpenChangePassword && (
                <button
                  type="button"
                  id="change-password-modal-btn"
                  onClick={() => {
                    onClose();
                    onOpenChangePassword();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-xs transition"
                  title="Change Administrator Password"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Change Password</span>
                </button>
              )}
              <button
                id="logout-btn"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 text-xs font-semibold border border-stone-200 transition shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-stone-200 px-6 pt-3 bg-stone-100/70">
          <button
            onClick={() => { setActiveTab('admin'); setErrorMsg(''); }}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'border-blue-900 text-blue-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Expedition Administrators</span>
          </button>
          <button
            onClick={() => { setActiveTab('guest'); setErrorMsg(''); }}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeTab === 'guest'
                ? 'border-blue-900 text-blue-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Guest & Follower Login</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-4">
              
              {/* Select Admin Account */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Select Your Account:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ADMIN_USERS.map((admin) => {
                    const isSelected = selectedAdmin.id === admin.id;
                    return (
                      <button
                        type="button"
                        key={admin.id}
                        id={`select-admin-${admin.id}`}
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setErrorMsg('');
                        }}
                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition shadow-xs ${
                          isSelected
                            ? 'bg-blue-50 border-blue-900 ring-2 ring-blue-900 text-blue-950'
                            : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-800'
                        }`}
                      >
                        <img
                          src={admin.avatar}
                          alt={admin.name}
                          className="w-11 h-11 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">{admin.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-blue-900 shrink-0" />}
                          </div>
                          <div className="text-[11px] text-blue-900 font-semibold truncate">{admin.email}</div>
                          <div className="text-[10px] text-stone-500 truncate">Expedition Co-Leader</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CASE 1: NO PASSWORD CONFIGURED YET (First-Time Setup) */}
              {!hasPasswordSet ? (
                <div className="space-y-4 pt-1 border-t border-stone-200">
                  <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900 text-sm">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>First-Time Login: Set Your Password</span>
                    </div>
                    <p className="text-amber-900/90 leading-relaxed">
                      Choose your own private password to secure your admin account, or sign in directly.
                    </p>
                  </div>

                  <form onSubmit={handleSetPasswordAndLogin} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Choose a Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Create password"
                            className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat password"
                            className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? 'Hide password' : 'Show password'}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading || !newPassword.trim()}
                        className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Save Password & Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>

                  {/* Instant 1-Click Sign In Alternative */}
                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-xs text-stone-500">Or sign in right away without setting a password:</span>
                    <button
                      type="button"
                      onClick={handleDirectAdminLogin}
                      disabled={isLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Sign In Directly as {selectedAdmin.name}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* CASE 2: PASSWORD IS SET - PROMPT FOR PASSWORD */
                <form onSubmit={handleExistingPasswordSubmit} className="space-y-4 pt-1 border-t border-stone-200">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Enter Administrator Password
                      </label>
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        className="text-[11px] text-blue-900 hover:underline flex items-center gap-1 font-semibold"
                        title="Clear and reset your administrator password"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset / Clear Password</span>
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Enter your administrator password"
                        className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-12 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-stone-500 hover:text-stone-800"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 font-medium text-xs"
                    >
                      Cancel
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDirectAdminLogin}
                        className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs"
                      >
                        Sign In Directly
                      </button>
                      <button
                        id="admin-login-submit-btn"
                        type="submit"
                        disabled={isLoading || !adminPassword.trim()}
                        className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sign In as {selectedAdmin.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </form>
              )}

            </div>
          )}

          {activeTab === 'guest' && (
            <form onSubmit={handleGuestSubmit} className="space-y-3.5 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-950 flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                <p>
                  <strong>Guest & Follower Sign In:</strong> Sign in with your name and email to leave comments and follow along.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah, Dr. Emily, Alex"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={subscribeToUpdates}
                    onChange={(e) => setSubscribeToUpdates(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-blue-900 focus:ring-blue-900"
                  />
                  <span className="text-stone-700">
                    Notify me by email whenever Joannie & Barton post a new journal entry
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !email.trim() || !name.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold flex items-center gap-2 shadow-xs transition disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Sign In as Guest</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
