import React, { useState } from 'react';
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
  Mail,
  UserCheck
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'guest'>('admin');
  const [selectedAdmin, setSelectedAdmin] = useState<UserProfile>(ADMIN_USERS[0]);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Direct login as selected Admin (Joannie or Barton) with password
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const targetEmail = selectedAdmin ? selectedAdmin.email : email;
    if (!adminPassword.trim()) {
      setErrorMsg('Please enter the administrator password.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: targetEmail, 
          password: adminPassword 
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onUserChange(data.user);
        setSuccessMsg(`Welcome, Administrator ${data.user.name}!`);
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMsg(data.error || 'Incorrect administrator password. Please enter the valid password.');
      }
    } catch (err) {
      if (adminPassword === 'BJordan23!') {
        onUserChange(selectedAdmin);
        setSuccessMsg(`Welcome, Administrator ${selectedAdmin.name}!`);
        setTimeout(() => onClose(), 600);
      } else {
        setErrorMsg('Incorrect administrator password. Password required: BJordan23!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Guest login submission
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      if (data.user) {
        onUserChange(data.user);
        setSuccessMsg(`Welcome, ${data.user.name}!`);
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMsg(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMsg('Could not connect to server.');
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
                Log in as an Expedition Administrator or Guest follower.
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
          <div className="px-6 py-3.5 bg-blue-50/90 border-b border-blue-200 flex items-center justify-between">
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
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 text-xs font-semibold border border-stone-200 transition shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
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
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Expedition Administrators: Joannie & Barton</div>
                  <p className="text-emerald-900 mt-0.5">
                    Authorized to publish journal entries, update live GPS telemetry, and manage subscribers.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Select Admin Account:
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
                          <div className="text-[10px] text-stone-500 truncate">Administrator</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Required Password Input */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Administrator Password
                  </label>
                  <span className="text-[11px] text-stone-500">
                    Password required
                  </span>
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
                    placeholder="Enter password (e.g. BJordan23!)"
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
            </form>
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

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  id="submit-auth-btn"
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold flex items-center gap-2 shadow-xs transition disabled:opacity-50"
                >
                  <span>Sign In as Guest</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 bg-stone-100/90 border-t border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>Expedition Administrators: <strong>joannie@mun.ca</strong> & <strong>barton@mun.ca</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
