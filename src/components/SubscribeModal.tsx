import React, { useState } from 'react';
import { 
  Mail, 
  Check, 
  Send, 
  ShieldCheck,
  RefreshCw,
  Heart,
  Lock
} from 'lucide-react';
import { Subscriber } from '../types';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (sub: { email: string; name: string; relationshipNote?: string }) => Promise<{ success: boolean; message: string }>;
  approvedSubscribersCount?: number;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
  approvedSubscribersCount = 6
}) => {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [relationshipNote, setRelationshipNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setIsSubmitting(true);
    try {
      const res = await onSubscribe({
        email: email.trim(),
        name: name.trim() || email.split('@')[0],
        relationshipNote: relationshipNote.trim()
      });

      setSubmittedMessage(res.message || 'Subscription request submitted for Joannie & Barton to review.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="subscribe-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-stone-300/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-stone-800 space-y-6 my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-serif shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">
                Subscribe for Updates
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Get occasional journal updates directly from Joannie & Barton.
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

        {submittedMessage ? (
          <div className="text-center py-6 space-y-4 font-sans">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center shadow-sm">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">You're Subscribed! 🎉</h3>
            <p className="text-xs text-stone-700 max-w-sm mx-auto leading-relaxed">
              {submittedMessage}
            </p>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 text-xs flex items-center justify-center gap-2 border border-emerald-200">
              <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>A welcome email confirmation has been sent to your inbox.</span>
            </div>
            <button
              onClick={onClose}
              className="bg-blue-900 hover:bg-blue-950 text-white font-medium px-6 py-2.5 rounded-xl text-xs shadow-sm transition cursor-pointer"
            >
              Continue Exploring
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            
            <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-blue-950 leading-relaxed space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-900" />
                <span>Expedition Email Dispatches</span>
              </div>
              <p className="text-[11px] text-blue-900/90">
                Subscribe to receive personal email updates, photo albums, and road stories from Joannie & Barton as we journey 35,000 km across the Americas with baby Henri in Mousse.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Riley, Dr. Chen, Grandma Sarah"
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Note for Joannie & Barton (How do we know you?)
              </label>
              <input
                type="text"
                value={relationshipNote}
                onChange={(e) => setRelationshipNote(e.target.value)}
                placeholder="e.g. Hospital colleague, MBA cohort, family friend"
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <span className="text-[11px] text-stone-500">
                No spam, unsubscribe anytime.
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-900 hover:bg-blue-950 text-white font-medium px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Request Subscription</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
