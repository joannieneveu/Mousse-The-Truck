import React, { useState } from 'react';
import { 
  Mail, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Sparkles, 
  FileText, 
  Eye, 
  Send,
  Heart
} from 'lucide-react';
import { Subscriber } from '../types';
import { generateWelcomeEmailHtml } from '../utils/emailTemplateGenerator';

interface WelcomeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriber: Subscriber | null;
  adminName: string;
  autoSentMessage?: string | null;
}

export const WelcomeEmailModal: React.FC<WelcomeEmailModalProps> = ({
  isOpen,
  onClose,
  subscriber,
  adminName,
  autoSentMessage
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'text'>('preview');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  if (!isOpen || !subscriber) return null;

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://mousseontheloose.ca';
  const emailContent = generateWelcomeEmailHtml({
    subscriberName: subscriber.name,
    subscriberEmail: subscriber.email,
    appBaseUrl: appOrigin
  });

  const mailtoSubject = encodeURIComponent(emailContent.defaultSubject);
  // Shorten/format body for mailto URI compatibility
  const mailtoBody = encodeURIComponent(emailContent.plainText);
  const mailtoHref = `mailto:${subscriber.email}?subject=${mailtoSubject}&body=${mailtoBody}`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(emailContent.plainText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(emailContent.html);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div 
      id="welcome-email-dispatch-modal"
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl text-stone-800 space-y-5 my-6 animate-in zoom-in-95 duration-200 font-sans">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-serif shadow-sm shrink-0">
              <Mail className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Welcome Message
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200">
                  {subscriber.name}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Recipient: <span className="font-medium text-stone-700">{subscriber.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-200 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification Banner */}
        {autoSentMessage ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-3.5 text-xs flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold">Server Dispatch Complete: </span>
              {autoSentMessage}
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 text-blue-950 rounded-2xl p-3.5 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                Personalized welcome dispatch prepared! Click below to send directly via your email app or copy the text.
              </span>
            </div>
          </div>
        )}

        {/* Quick Send Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5 bg-stone-100/80 p-3 rounded-2xl border border-stone-200/80">
          <a
            href={mailtoHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open in Email App (Send to {subscriber.email})</span>
          </a>

          <button
            onClick={handleCopyText}
            className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'Copied Text!' : 'Copy Letter'}</span>
          </button>

          <button
            onClick={handleCopyHtml}
            className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{copiedHtml ? 'Copied HTML!' : 'Copy HTML'}</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
                activeTab === 'preview' 
                  ? 'bg-blue-900 text-white shadow-2xs' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Email Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
                activeTab === 'text' 
                  ? 'bg-blue-900 text-white shadow-2xs' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Plain Text Letter</span>
            </button>
          </div>
          <span className="text-[11px] text-stone-400">
            Subject: {emailContent.defaultSubject}
          </span>
        </div>

        {/* Preview Container */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-inner max-h-[360px] overflow-y-auto">
          {activeTab === 'preview' ? (
            <div className="p-4 sm:p-6 bg-[#F5F3EF]">
              <div 
                className="max-w-[540px] mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden text-stone-800 text-sm"
                dangerouslySetInnerHTML={{ __html: emailContent.html }}
              />
            </div>
          ) : (
            <pre className="p-4 text-xs font-mono text-stone-700 whitespace-pre-wrap leading-relaxed">
              {emailContent.plainText}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 pt-4 text-xs">
          <span className="text-stone-500 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            Signed by Joannie, Barton, Henri & Mousse
          </span>
          <button
            onClick={onClose}
            className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-4 py-2 rounded-xl font-medium transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
