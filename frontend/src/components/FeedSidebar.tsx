'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Compass, Home, Menu, Search, Trash2, UserRound, X } from 'lucide-react';

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
  onSearchClick: () => void;
  addActivity: (message: string) => void;
}

const baseLinkClass = 'relative flex w-auto items-center justify-center gap-4 rounded-xl px-3 py-3.5 text-left text-[15px] text-slate-400 transition hover:bg-white/[0.06] hover:text-white lg:w-full lg:justify-start lg:px-4';

export default function FeedSidebar({
  notifications,
  setNotifications,
  onProfileClick,
  onExploreClick,
  onSettingsClick,
  onSupportClick,
  onSearchClick,
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
    <>
      <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-white/10 bg-[#111216] px-5 lg:hidden">
        <a href="#top" className="flex items-center gap-3" aria-label="Pulse of Profit home">
          <img src="/logo.png" alt="" className="h-9 w-9 rounded-xl object-contain" />
          <span className="text-xl font-semibold tracking-tight text-white">Home</span>
        </a>
        <button onClick={() => { setIsMoreOpen(!isMoreOpen); setIsNotificationsOpen(false); }} aria-label="Open more menu" aria-expanded={isMoreOpen} className="rounded-lg p-2 text-slate-300 hover:bg-white/10">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      <aside className="fixed inset-x-0 bottom-0 z-40 flex h-[68px] items-center justify-around border-t border-white/10 bg-[#111216] px-2 pb-[env(safe-area-inset-bottom)] pt-1 lg:sticky lg:top-0 lg:inset-auto lg:h-screen lg:flex-col lg:items-stretch lg:justify-start lg:border-0 lg:bg-transparent lg:px-0 lg:py-7">
      <a href="#top" className="mb-10 ml-3 hidden w-fit items-center lg:inline-flex" aria-label="Pulse of Profit home">
        <img src="/logo.png" alt="Pulse of Profit" className="h-14 w-14 rounded-2xl object-contain" />
      </a>

      <nav className="flex w-full items-center justify-around space-y-0 lg:block lg:space-y-2" aria-label="Main navigation">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Home" className={`${baseLinkClass} font-semibold text-white`}>
          <Home className="h-6 w-6 lg:h-5 lg:w-5" /><span className="hidden lg:inline">Home</span>
        </button>

        <div className="relative">
          <button onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsMoreOpen(false); }} className={baseLinkClass} aria-label="Notifications" aria-expanded={isNotificationsOpen}>
            <Bell className="h-6 w-6 lg:h-5 lg:w-5" /><span className="hidden flex-1 lg:inline">Notifications</span>
            {unreadCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#42E8FF] px-1 text-[9px] font-bold text-slate-950 lg:static lg:h-auto lg:min-w-0 lg:px-2 lg:py-0.5 lg:text-[10px]">{unreadCount}</span>}
          </button>
          {isNotificationsOpen && (
            <div className="fixed bottom-[calc(5rem_+_env(safe-area-inset-bottom))] left-3 right-3 z-50 rounded-2xl border border-white/10 bg-[#0b111b] p-4 shadow-2xl lg:absolute lg:bottom-auto lg:left-full lg:right-auto lg:top-0 lg:ml-3 lg:w-[320px]">
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

        <button onClick={onExploreClick} aria-label="Explore" className={baseLinkClass}>
          <Compass className="h-6 w-6 lg:h-5 lg:w-5" /><span className="hidden lg:inline">Explore</span>
        </button>
        <button onClick={onProfileClick} aria-label="Profile" className={baseLinkClass}>
          <UserRound className="h-6 w-6 lg:h-5 lg:w-5" /><span className="hidden lg:inline">Profile</span>
        </button>
        <button onClick={onSearchClick} aria-label="Search bulletins" className={`${baseLinkClass} lg:hidden`}>
          <Search className="h-6 w-6" />
        </button>
      </nav>

      <div className="relative mt-auto hidden lg:block">
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

      {isMoreOpen && (
        <div className="fixed right-3 top-[76px] z-50 w-[260px] overflow-hidden rounded-2xl border border-white/10 bg-[#121212] py-2 shadow-2xl lg:hidden">
          <button onClick={() => { setIsMoreOpen(false); onSettingsClick(); }} className="block w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white">Settings</button>
          <button onClick={() => { setIsMoreOpen(false); onSupportClick(); }} className="block w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white">Support</button>
          <div className="my-1 border-t border-white/10" />
          <a href="#about" onClick={() => setIsMoreOpen(false)} className="block px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white">About</a>
          <a href="#privacy" onClick={() => setIsMoreOpen(false)} className="block px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white">Privacy</a>
          <a href="#terms" onClick={() => setIsMoreOpen(false)} className="block px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white">Terms</a>
        </div>
      )}
    </>
  );
}
