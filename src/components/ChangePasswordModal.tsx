import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, Check, AlertCircle, Eye, EyeOff, X, RotateCcw } from 'lucide-react';
import { verifyAdminPassword, updateAdminPassword, isPasswordConfigured, clearAdminPassword } from '../lib/authCrypto';
import { UserProfile } from '../types';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const isConfigured = isPasswordConfigured();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      // 1. Verify current password if one was set
      if (isConfigured && currentPassword) {
        const isValid = await verifyAdminPassword(currentPassword);
        if (!isValid) {
          setErrorMsg('Current password does not match. If you forgot it, click "Reset Password".');
          setIsLoading(false);
          return;
        }
      }

      // 2. Verify new password match & length
      if (newPassword.length < 4) {
        setErrorMsg('New password must be at least 4 characters long.');
        setIsLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation do not match.');
        setIsLoading(false);
        return;
      }

      // 3. Perform cryptographic salt & hash update
      const result = await updateAdminPassword(newPassword);
      if (result.success) {
        setSuccessMsg('Administrator password successfully saved and encrypted!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(result.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while updating the password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    await clearAdminPassword();
    setSuccessMsg('Password requirement cleared! You will be prompted to set a new password next time.');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-50 border border-stone-300 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-900 text-white shadow-xs">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isConfigured ? 'Change Admin Password' : 'Set Admin Password'}
              </h2>
              <p className="text-xs text-stone-500">
                Encrypted cryptographic password management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <div className="p-6 space-y-4">
          
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Expedition Co-Leaders: Joannie & Barton</div>
              <p className="text-blue-900 mt-0.5 leading-relaxed">
                Your password is protected with salted SHA-256 encryption.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            {/* Current Password (only if one was configured) */}
            {isConfigured && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Current Password
                  </label>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] text-blue-900 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset / Clear</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password (or click Reset)"
                    className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-12 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-stone-500 hover:text-stone-800"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                New Custom Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-12 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Check className="w-4 h-4" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-12 py-2.5 text-stone-900 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword}
                className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold flex items-center gap-2 shadow-xs transition disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isLoading ? 'Saving...' : 'Save Password'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
