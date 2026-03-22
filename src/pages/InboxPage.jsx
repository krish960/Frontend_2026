import React, { useEffect, useState } from 'react';
import { Mail, Trash2, Circle } from 'lucide-react';
import DashboardLayout from '../components/shared/DashboardLayout';
import { messagingApi } from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function InboxPage() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messagingApi.inbox()
      .then(({ data }) => setMessages(data.messages || []))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (msg) => {
    setSelected(msg);
    if (!msg.is_read) {
      try {
        await messagingApi.markRead(msg.id);
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch {}
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await messagingApi.delete(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success('Message deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <DashboardLayout title="Inbox">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-100">Inbox</h2>
          <p className="text-slate-400 mt-1">{messages.length} message{messages.length !== 1 ? 's' : ''}{unread > 0 && `, ${unread} unread`}</p>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-260px)]">
        {/* Message list */}
        <div className="w-80 flex-shrink-0 glass rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10">
            <p className="text-sm font-medium text-slate-300">All Messages</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-3 w-2/3 bg-white/5 rounded" />
                    <div className="h-2 w-full bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center">
                <InboxIcon size={28} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No messages yet</p>
                <p className="text-xs text-slate-600 mt-1">Messages from your portfolio's contact form will appear here</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelect(msg)}
                  className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors relative ${
                    selected?.id === msg.id ? 'bg-brand-500/10 border-brand-500/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.is_read && (
                        <Circle size={7} className="fill-brand-400 text-brand-400 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm truncate ${msg.is_read ? 'text-slate-400' : 'text-slate-100 font-medium'}`}>
                        {msg.sender_name}
                      </p>
                    </div>
                    <button onClick={(e) => handleDelete(msg.id, e)}
                      className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5 ml-3">{msg.subject || msg.message}</p>
                  <p className="text-xs text-slate-600 mt-1 ml-3">
                    {format(new Date(msg.sent_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message detail */}
        <div className="flex-1 glass rounded-2xl overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="p-5 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-100">{selected.subject || 'No subject'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-400">From:</span>
                      <span className="text-sm font-medium text-slate-200">{selected.sender_name}</span>
                      <span className="text-sm text-brand-400">&lt;{selected.sender_email}&gt;</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {format(new Date(selected.sent_at), 'MMMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                  <button onClick={(e) => handleDelete(selected.id, e)} className="btn-danger text-sm py-1.5">
                    <Trash2 size={14} className="mr-1.5" /> Delete
                  </button>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="p-4 border-t border-white/10">
                <a
                  href={`mailto:${selected.sender_email}?subject=Re: ${selected.subject || 'Your message'}`}
                  className="btn-primary text-sm inline-flex items-center gap-2"
                >
                  <Mail size={14} /> Reply via Email
                </a>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail size={36} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
