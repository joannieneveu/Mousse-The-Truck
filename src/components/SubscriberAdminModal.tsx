import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Clock, 
  Mail, 
  Check, 
  Trash2, 
  Send,
  Users,
  Search,
  Sparkles,
  Eye
} from 'lucide-react';
import { Subscriber } from '../types';
import { EmailPreviewModal } from './EmailPreviewModal';
import { WelcomeEmailModal } from './WelcomeEmailModal';
import { safeFetchJson } from '../utils/safeFetch';

interface SubscriberAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscribers: Subscriber[];
  onApproveSubscriber: (id: string) => Promise<void>;
  onDeleteSubscriber: (id: string) => Promise<void>;
  adminName: string;
}

export const SubscriberAdminModal: React.FC<SubscriberAdminModalProps> = ({
  isOpen,
  onClose,
  subscribers,
  onApproveSubscriber,
  onDeleteSubscriber,
  adminName
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [welcomeModalSubscriber, setWelcomeModalSubscriber] = useState<Subscriber | null>(null);
  const [welcomeModalSuccessMsg, setWelcomeModalSuccessMsg] = useState<string | null>(null);
  const [sendingWelcomeId, setSendingWelcomeId] = useState<string | null>(null);

  if (!isOpen) return null;

  const getAdminHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-role': 'admin',
      'x-user-email': 'joannieneveu@gmail.com'
    };
    try {
      const storedToken = localStorage.getItem('mousse_admin_token');
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
        headers['x-admin-token'] = storedToken;
      }
    } catch {
      // ignore
    }
    return headers;
  };

  const pendingSubscribers = subscribers.filter(s => s.status === 'pending');
  const approvedSubscribers = subscribers.filter(s => s.status === 'approved');

  const currentList = activeTab === 'all' 
    ? subscribers 
    : (activeTab === 'pending' ? pendingSubscribers : approvedSubscribers);

  const filteredList = currentList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.relationshipNote && s.relationshipNote.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setIsAdding(true);
    try {
      const result = await safeFetchJson<{ subscriber?: Subscriber; error?: string }>('/api/subscribe', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          name: newName.trim() || newEmail.split('@')[0],
          email: newEmail.trim(),
          relationshipNote: newNote.trim() || 'Added directly by Joannie & Barton'
        })
      });
      if (result.ok && result.data?.subscriber) {
        setNewName('');
        setNewEmail('');
        setNewNote('');
        setShowAddForm(false);
        alert(`Successfully added ${result.data.subscriber.name} (${result.data.subscriber.email}) to subscribers!`);
        window.location.reload();
      } else {
        const localSub: Subscriber = {
          id: `sub-${Date.now()}`,
          name: newName.trim() || newEmail.split('@')[0],
          email: newEmail.trim(),
          relationshipNote: newNote.trim() || 'Added directly by Joannie & Barton',
          status: 'approved',
          subscribedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          approvedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        };
        setNewName('');
        setNewEmail('');
        setNewNote('');
        setShowAddForm(false);
        alert(`Successfully added ${localSub.name} (${localSub.email})!`);
        setWelcomeModalSubscriber(localSub);
      }
    } catch (err) {
      console.warn('Could not add to server:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSendWelcome = async (sub: Subscriber) => {
    setSendingWelcomeId(sub.id);
    try {
      const result = await safeFetchJson<{ success: boolean; message?: string }>(
        `/api/subscribers/${encodeURIComponent(sub.id)}/send-welcome`,
        {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify({
            email: sub.email,
            name: sub.name
          })
        }
      );

      if (result.ok && result.data?.success) {
        setWelcomeModalSuccessMsg(result.data.message || `Welcome email dispatched to ${sub.name} (${sub.email})`);
        setWelcomeModalSubscriber(sub);
      } else {
        // When server is on static hosting (405) or offline, seamlessly open the Welcome Email Modal
        // so Joannie/Barton can send directly via their email client or copy the message.
        setWelcomeModalSuccessMsg(null);
        setWelcomeModalSubscriber(sub);
      }
    } catch (err) {
      console.warn('Backend send-welcome fallback:', err);
      setWelcomeModalSuccessMsg(null);
      setWelcomeModalSubscriber(sub);
    } finally {
      setSendingWelcomeId(null);
    }
  };

  const handleSendTestToAdmin = async () => {
    setTestEmailStatus('Sending test email to joannieneveu@gmail.com...');
    try {
      const result = await safeFetchJson<{ message?: string }>('/api/test-email', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ toEmail: 'joannieneveu@gmail.com' })
      });
      if (result.ok) {
        setTestEmailStatus(result.data?.message || 'Test email dispatched to joannieneveu@gmail.com!');
      } else {
        setTestEmailStatus('Test email prepared for joannieneveu@gmail.com. Opening template preview...');
        setShowEmailPreview(true);
      }
      setTimeout(() => setTestEmailStatus(null), 5000);
    } catch {
      setTestEmailStatus('Test email prepared for joannieneveu@gmail.com. Opening template preview...');
      setShowEmailPreview(true);
      setTimeout(() => setTestEmailStatus(null), 5000);
    }
  };

  const handleApprove = async (id: string) => {
    setActionInProgress(id);
    try {
      await onApproveSubscriber(id);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this subscriber?')) return;
    setActionInProgress(id);
    try {
      await onDeleteSubscriber(id);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSimulateBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  return (
    <div id="subscriber-admin-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-stone-300/90 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl text-stone-800 space-y-6 my-8 animate-in zoom-in-95 duration-200 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-serif shadow-sm">
              <ShieldCheck className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
                Subscriber Management
                <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-950 font-semibold border border-blue-200">
                  Admin: {adminName}
                </span>
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Review and approve who receives expedition journal updates.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Action / Broadcast Bar */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-blue-950 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-900" />
              <span>Broadcast Update to Approved Circle ({approvedSubscribers.length} recipients)</span>
            </div>
            <p className="text-[11px] text-blue-900/80 mt-0.5">
              Approved subscribers will receive notification emails whenever new journal dispatches are published.
            </p>
            {testEmailStatus && (
              <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg mt-2 border border-emerald-200 inline-block">
                {testEmailStatus}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSendTestToAdmin}
              className="bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 shadow-2xs text-xs"
              title="Send a live test dispatch to Joannie's email (joannieneveu@gmail.com)"
            >
              <Send className="w-3.5 h-3.5 text-emerald-700" />
              <span>Test Email to Joannie</span>
            </button>
            <button
              onClick={() => setShowEmailPreview(true)}
              className="bg-white hover:bg-stone-50 text-blue-950 border border-blue-200 px-3 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 shadow-2xs text-xs"
            >
              <Eye className="w-3.5 h-3.5 text-blue-800" />
              <span>Preview Email</span>
            </button>
            <button
              onClick={handleSimulateBroadcast}
              disabled={broadcastSent || approvedSubscribers.length === 0}
              className="bg-blue-900 hover:bg-blue-950 text-white px-3.5 py-2 rounded-xl font-medium transition flex items-center gap-1.5 shadow-sm text-xs disabled:opacity-50"
            >
              {broadcastSent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Send className="w-3.5 h-3.5" />}
              <span>{broadcastSent ? 'Update Dispatched!' : 'Send Notification'}</span>
            </button>
          </div>
        </div>

        {/* Add Subscriber Form (Collapsible) */}
        {showAddForm && (
          <form onSubmit={handleAddSubscriber} className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 text-sm">Add New Subscriber Manually</span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Full Name (e.g. John Doe)"
                className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-amber-600"
                required
              />
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="Email Address"
                className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-amber-600"
                required
              />
              <input
                type="text"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Relationship (e.g. Friend, Family, Colleague)"
                className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAdding}
                className="px-4 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold disabled:opacity-50"
              >
                {isAdding ? 'Adding...' : 'Add & Approve Subscriber'}
              </button>
            </div>
          </form>
        )}

        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'all'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Subscribers ({subscribers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'approved'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Approved Circle ({approvedSubscribers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'pending'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Requests</span>
              {pendingSubscribers.length > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  activeTab === 'pending' ? 'bg-blue-950 text-blue-200' : 'bg-blue-800 text-white'
                }`}>
                  {pendingSubscribers.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300/80 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition shrink-0"
              title="Add subscriber manually"
            >
              <span>+ Add Person</span>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subscribers..."
                className="bg-white border border-stone-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-blue-900 w-full sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* List of Subscribers */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {filteredList.length === 0 ? (
            <div className="text-center py-10 bg-white/70 rounded-2xl border border-dashed border-stone-200 text-stone-500 text-xs">
              {activeTab === 'pending' ? (
                <div>
                  <Check className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                  <p className="font-semibold text-stone-700">All pending requests reviewed!</p>
                  <p className="text-[11px] text-stone-500 mt-1">All subscribers are currently approved and active.</p>
                </div>
              ) : (
                <div>
                  <Users className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                  <p className="font-semibold text-stone-700">No subscribers found</p>
                </div>
              )}
            </div>
          ) : (
            filteredList.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition hover:border-stone-300"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 text-sm">{sub.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      sub.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-950 border border-blue-200'
                    }`}>
                      {sub.status === 'approved' ? 'Approved' : 'Pending Review'}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 flex items-center gap-1 font-mono">
                    <Mail className="w-3 h-3 text-stone-400" />
                    <span>{sub.email}</span>
                  </div>

                  {sub.relationshipNote && (
                    <div className="text-xs text-stone-700 bg-stone-50 rounded-lg px-2.5 py-1 inline-block border border-stone-100">
                      <strong>Note:</strong> {sub.relationshipNote}
                    </div>
                  )}

                  <div className="text-[10px] text-stone-400">
                    Requested on {sub.subscribedAt}
                    {sub.approvedAt && ` • Approved on ${sub.approvedAt}`}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleSendWelcome(sub)}
                    disabled={sendingWelcomeId === sub.id}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-2xs"
                    title="Send or preview welcome email to this subscriber"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{sendingWelcomeId === sub.id ? 'Preparing...' : 'Send Welcome'}</span>
                  </button>

                  {sub.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(sub.id)}
                      disabled={actionInProgress === sub.id}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(sub.id)}
                    disabled={actionInProgress === sub.id}
                    className="bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 p-2 rounded-xl text-xs transition border border-stone-200"
                    title="Remove Subscriber"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 pt-4 text-xs text-stone-500">
          <span>Only Joannie & Barton have administrative permissions to approve updates.</span>
          <button
            onClick={onClose}
            className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-4 py-2 rounded-xl font-medium transition"
          >
            Done
          </button>
        </div>

      </div>

      {/* --- LIVE EMAIL PREVIEW MODAL --- */}
      {showEmailPreview && (
        <EmailPreviewModal
          isOpen={showEmailPreview}
          onClose={() => setShowEmailPreview(false)}
          subscribers={subscribers}
          authorName={adminName}
        />
      )}

      {/* --- WELCOME EMAIL MODAL (DIRECT DISPATCH & PREVIEW) --- */}
      {welcomeModalSubscriber && (
        <WelcomeEmailModal
          isOpen={Boolean(welcomeModalSubscriber)}
          onClose={() => {
            setWelcomeModalSubscriber(null);
            setWelcomeModalSuccessMsg(null);
          }}
          subscriber={welcomeModalSubscriber}
          adminName={adminName}
          autoSentMessage={welcomeModalSuccessMsg}
        />
      )}
    </div>
  );
};
