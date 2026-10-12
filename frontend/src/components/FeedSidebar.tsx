'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Compass, Home, Menu, Trash2, UserRound, X } from 'lucide-react';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  postId?: string;
};

interface FeedSidebarProps {
  notifications: NotificationItem[];
  setNotifications: (items: NotificationItem[]) => void;
  onProfileClick: () => void;
  onExploreClick: () => void;
  onSettingsClick: () => void;
  onSupportClick: () => void;
  addActivity: (message: string) => void;
}

const baseLinkClass = 'flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-[15px] text-slate-400 transition hover:bg-white/[0.06] hover:text-white';

export default function FeedSidebar({
  notifications,
  setNotifications,
  onProfileClick,
  onExploreClick,
  onSettingsClick,
  onSupportClick,
  addActivity
}: FeedSidebarProps) {
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;

  const openNotification = (item: NotificationItem) => {
    setNotifications(notifications.map((notification) => notification.id === item.id ? { ...notification, read: true } : notification));
    setIsNotificationsOpen(false);
    if (item.postId) router.push(`/posts/${item.postId}`);
    addActivity(`Opened notification: ${item.title}`);
  };

  return (
    <aside className="sticky top-0 hidden h-screen flex-col py-7 xl:flex">
      <a href="#top" className="mb-10 ml-3 inline-flex w-fit items-center" aria-label="Pulse of Profit home">
        <img src="/logo.png" alt="Pulse of Profit" className="h-14 w-14 rounded-2xl object-contain" />
      </a>

      <nav className="space-y-2" aria-label="Main navigation">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`${baseLinkClass} font-semibold text-white`}>
          <Home className="h-5 w-5" /><span>Home</span>
        </button>

        <div className="relative">
          <button onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsMoreOpen(false); }} className={baseLinkClass} aria-expanded={isNotificationsOpen}>
            <Bell className="h-5 w-5" /><span className="flex-1">Notifications</span>
            {unreadCount > 0 && <span className="rounded-full bg-[#42E8FF] px-2 py-0.5 text-[10px] font-bold text-slate-950">{unreadCount}</span>}
          </button>
          {isNotificationsOpen && (
            <div className="absolute left-full top-0 z-50 ml-3 w-[320px] rounded-2xl border border-white/10 bg-[#0b111b] p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-sm font-bold text-white">Notifications</h2>
                <div className="flex items-center gap-1">
                  <button onClick={() => setNotifications(notifications.map((item) => ({ ...item, read: true })))} aria-label="Mark all notifications as read" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><CheckCheck className="h-4 w-4" /></button>
                  <button onClick={() => setNotifications([])} aria-label="Clear notifications" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><Trash2 className="h-4 w-4" /></button>
                  <button onClick={() => setIsNotificationsOpen(false)} aria-label="Close notifications" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="max-h-[60vh] space-y-2 overflow-y-auto">
                {notifications.length === 0 ? <p className="py-8 text-center text-xs text-slate-500">No active alerts</p> : notifications.map((item) => (
                  <button key={item.id} onClick={() => openNotification(item)} className={`w-full rounded-xl border p-3 text-left transition hover:border-[#42E8FF]/30 ${item.read ? 'border-white/5 bg-white/[0.025]' : 'border-[#42E8FF]/20 bg-[#42E8FF]/[0.06]'}`}>
                    <span className="block text-xs font-semibold text-white">{item.title}</span>
                    <span className="mt-1 block text-[11px] leading-5 text-slate-400">{item.message}</span>
                    <span className="mt-2 block text-[9px] uppercase tracking-wide text-slate-500">{item.time}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={onExploreClick} className={baseLinkClass}>
          <Compass className="h-5 w-5" /><span>Explore</span>
        </button>
        <button onClick={onProfileClick} className={baseLinkClass}>
          <UserRound className="h-5 w-5" /><span>Profile</span>
        </button>
      </nav>

      <div className="relative mt-auto">
        {isMoreOpen && (
          <div className="absolute bottom-14 left-0 z-50 w-[260px] overflow-hidden rounded-2xl border border-white/10 bg-[#121212] py-2 shadow-2xl">
            <button onClick={() => { setIsMoreOpen(false); onSettingsClick(); }} className="block w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white">Settings</button>
            <button onClick={() => { setIsMoreOpen(false); onSupportClick(); }} className="block w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white">Support</button>
            <div className="my-1 border-t border-white/10" />
            <a href="#about" onClick={() => setIsMoreOpen(false)} className="block px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white">About</a>
            <a href="#privacy" onClick={() => setIsMoreOpen(false)} className="block px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white">Privacy</a>
            <a href="#terms" onClick={() => setIsMoreOpen(false)} className="block px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white">Terms</a>
          </div>
        )}
        <button onClick={() => { setIsMoreOpen(!isMoreOpen); setIsNotificationsOpen(false); }} aria-expanded={isMoreOpen} className={baseLinkClass}>
          <Menu className="h-5 w-5" /><span>More</span>
        </button>
      </div>
    </aside>
  );
}
