'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Trash2, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onProfileClick: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onSearchClick?: () => void;
  notifications?: any[];
  setNotifications?: (notifs: any[]) => void;
  addActivity?: (message: string) => void;
}

export default function Header({ 
  onProfileClick, 
  isDarkMode, 
  toggleDarkMode, 
  onSearchClick,
  notifications = [],
  setNotifications = () => {},
  addActivity = () => {}
}: HeaderProps) {
  const { user, openAuthModal } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleOutsideInteraction = (event: MouseEvent | TouchEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleOutsideInteraction);
      document.addEventListener('touchstart', handleOutsideInteraction);
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('touchstart', handleOutsideInteraction);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isNotificationsOpen]);

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    addActivity("Marked all notifications as read");
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications([]);
    addActivity("Cleared all notifications");
  };

  const handleNotificationClick = (notif: any) => {
    const updated = notifications.map(n => n.id === notif.id ? { ...n, read: true } : n);
    setNotifications(updated);
    setIsNotificationsOpen(false);

    if (notif.postId) {
      addActivity(`Opened notification for post: ${notif.title}`);
      const postEl = document.getElementById(`post-card-${notif.postId}`);
      if (postEl) {
        postEl.scrollIntoView({ behavior: 'smooth' });
        postEl.classList.add('ring-2', 'ring-[#42E8FF]/50');
        setTimeout(() => {
          postEl.classList.remove('ring-2', 'ring-[#42E8FF]/50');
        }, 3000);
      } else {
        window.location.href = `/posts/${notif.postId}`;
      }
    } else {
      addActivity(`Opened notification: ${notif.title}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#050505]/85 border-b border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Custom Pulse of Profit Logo */}
        <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-2xl btn-cyan-gradient font-extrabold text-black font-display text-base sm:text-lg shadow-[0_0_15px_rgba(66,232,255,0.4)]">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-white text-sm sm:text-base md:text-lg tracking-tight group-hover:text-[#42E8FF] transition-colors flex items-center space-x-1">
              <span>PULSE OF PROFIT</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#4DFFB8]" />
            </span>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2.5 rounded-full bg-[#0D1624]/90 border border-white/10 hover:border-[#42E8FF]/40 text-[#A0A7B5] hover:text-white transition-all relative backdrop-blur-md" 
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#2D9CFF] to-[#42E8FF] text-[9px] font-extrabold text-black shadow-[0_0_8px_rgba(66,232,255,0.8)]">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30 cursor-pointer" 
                  onClick={() => setIsNotificationsOpen(false)}
                  onTouchStart={() => setIsNotificationsOpen(false)}
                />
                
                <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-[20px] glass-panel p-4 z-40 text-white font-sans border border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                    <h3 className="font-display font-bold text-sm text-white flex items-center space-x-2">
                      <span>Telemetry Alerts</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-[#42E8FF]/20 text-[#42E8FF] px-2.5 py-0.5 rounded-full font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-1.5">
                      <button 
                        onClick={handleMarkAllRead}
                        className="p-1 rounded hover:bg-white/10 text-[#A0A7B5] hover:text-white transition-colors text-xs"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={handleClearAll}
                        className="p-1 rounded hover:bg-white/10 text-[#A0A7B5] hover:text-red-400 transition-colors text-xs"
                        title="Clear all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setIsNotificationsOpen(false)}
                        className="p-1 rounded hover:bg-white/10 text-[#A0A7B5] hover:text-white transition-colors text-xs"
                        title="Close notifications"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-xs text-[#A0A7B5]">
                        No active alerts
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3 rounded-xl border text-left transition-all hover:border-[#42E8FF]/40 cursor-pointer relative ${
                            !notif.read 
                              ? 'bg-[#2D9CFF]/10 border-[#42E8FF]/30' 
                              : 'bg-[#0D1624]/60 border-white/5'
                          }`}
                        >
                          {!notif.read && (
                            <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-[#42E8FF] animate-pulse" />
                          )}
                          <div className="font-display font-semibold text-xs text-white pr-4">
                            {notif.title}
                          </div>
                          <div className="text-[11px] text-[#A0A7B5] mt-1 leading-snug">
                            {notif.message}
                          </div>
                          <div className="text-[9px] text-[#A0A7B5] mt-1.5 font-mono uppercase">
                            {notif.time}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Auth & Profile Controls */}
          {user ? (
            <button 
              onClick={onProfileClick}
              className="flex items-center p-2 rounded-full bg-[#0D1624] border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              aria-label="Open user menu"
              title="Profile Menu"
            >
              <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full bg-slate-800" />
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('register')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
