'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Bookmark, 
  Edit2, 
  Check, 
  ArrowLeft, 
  Trash2 
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

interface Profile {
  email: string;
  name: string;
  mob_no?: string;
  avatar: string;
  bio: string;
}

import { Post, Comment } from '@/types/post';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  initialPanel?: 'main' | 'settings' | 'support';
  apiBaseUrl: string;
  subscribedAuthors: string[];
  setSubscribedAuthors: (authors: string[]) => void;
  savedPostIds: string[];
  setSavedPostIds: (ids: string[]) => void;
  blockedAuthors: string[];
  setBlockedAuthors: (authors: string[]) => void;
  mutedAuthors: string[];
  setMutedAuthors: (authors: string[]) => void;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  activities: string[];
  addActivity: (message: string) => void;
  customPosts: Post[];
  setCustomPosts: (posts: Post[]) => void;
  reportedPostIds: string[];
  setReportedPostIds: (ids: string[]) => void;
}

export default function ProfileSidebar({ 
  isOpen, 
  onClose, 
  initialPanel = 'main',
  apiBaseUrl,
  subscribedAuthors,
  setSubscribedAuthors,
  savedPostIds,
  setSavedPostIds,
  blockedAuthors,
  setBlockedAuthors,
  mutedAuthors,
  setMutedAuthors,
  posts,
  setPosts,
  activities,
  addActivity,
  customPosts,
  setCustomPosts,
  reportedPostIds,
  setReportedPostIds
}: ProfileSidebarProps) {
  const router = useRouter();
  const { user, token, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [newBio, setNewBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sub-view panel state
  const [activePanel, setActivePanel] = useState<'main' | 'saved' | 'settings' | 'support'>('main');

  // Settings sub-view states
  const [settingsNotify, setSettingsNotify] = useState(true);
  const [settingsDigest, setSettingsDigest] = useState(false);

  // Support sub-view states
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  // Author Chat States
  const [selectedChatAuthor, setSelectedChatAuthor] = useState<string | null>(null);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Record<string, { sender: string; text: string; time: string }[]>>({});

  // Local Toast inside sidebar
  const [sidebarToast, setSidebarToast] = useState<string | null>(null);

  const showSidebarToast = (msg: string) => {
    setSidebarToast(msg);
    setTimeout(() => setSidebarToast(null), 2500);
  };

  useEffect(() => {
    if (user) {
      setProfile(user);
      setNewName(user.name);
      setNewBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) setActivePanel(initialPanel);
  }, [isOpen, initialPanel]);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          name: newName,
          bio: newBio,
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        updateUserProfile(updated);
        setIsEditing(false);
        addActivity("Updated profile name and bio");
        showSidebarToast("Profile updated!");
      } else {
        mockSaveFallback();
      }
    } catch (error) {
      mockSaveFallback();
    } finally {
      setIsSaving(false);
    }
  };

  const mockSaveFallback = () => {
    if (!profile) return;
    const updated = {
      ...profile,
      name: newName,
      bio: newBio
    };
    setProfile(updated);
    updateUserProfile(updated);
    setIsEditing(false);
    addActivity("Updated profile details (Local)");
    showSidebarToast("Profile updated!");
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatAuthor || !newChatMessage.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: "You", text: newChatMessage, time };
    
    // Add user message
    const currentMessages = chatMessages[selectedChatAuthor] || [];
    const nextMessages = [...currentMessages, userMsg];
    setChatMessages({
      ...chatMessages,
      [selectedChatAuthor]: nextMessages
    });
    
    const sentMsgText = newChatMessage;
    setNewChatMessage('');
    addActivity(`Sent message to ${selectedChatAuthor}`);

    // Mock auto reply after 1 second
    setTimeout(() => {
      let replyText = "Thanks for your thoughts! I will look into it in my next analysis.";
      if (selectedChatAuthor === "MICHAEL BURRY") {
        replyText = "The numbers don't lie. Look at the Case-Shiller index. Default rates are rising.";
      } else if (selectedChatAuthor === "SHOBIN SHEIKH") {
        replyText = "Excellent point. I'll cover this in the tomorrow morning's Pulse of Profit Bulletin. Stay tuned!";
      } else if (selectedChatAuthor === "JAYANT MUNDHRA") {
        replyText = "The blending policy is driving sugarcane demands. Sugar mills are looking very profitable right now.";
      }
      
      const replyMsg = { sender: selectedChatAuthor.split(' ')[0], text: replyText, time };
      setChatMessages(prev => ({
        ...prev,
        [selectedChatAuthor]: [...(prev[selectedChatAuthor] || []), replyMsg]
      }));
      addActivity(`Received auto-reply from ${selectedChatAuthor}`);
    }, 1000);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSubmitted(true);
    addActivity("Submitted support help ticket");
    setTimeout(() => {
      setSupportSubmitted(false);
      setSupportMessage('');
      setActivePanel('main');
      showSidebarToast("Support request sent!");
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#0D1624]/95 backdrop-blur-2xl border-l border-white/10 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto text-white font-sans">
        
        {/* Sidebar Toast */}
        {sidebarToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 btn-cyan-gradient text-black text-xs font-bold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(66,232,255,0.6)] animate-bounce">
            {sidebarToast}
          </div>
        )}

        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between mb-8">
            {activePanel !== 'main' ? (
              <button 
                onClick={() => {
                  setSelectedChatAuthor(null);
                  setActivePanel('main');
                }}
                className="inline-flex items-center space-x-1 text-sm text-text-muted hover:text-text-light dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <h2 className="font-headline font-bold text-lg text-text-light dark:text-white">My Account</h2>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-light dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {activePanel === 'main' && (
            /* MAIN MENU VIEW */
                <>
                  {/* User Profile Block */}
                  {profile && (
                    <div className="mb-6 p-4 rounded-xl glass-panel border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <img 
                          src={profile.avatar} 
                          alt={profile.name} 
                          className="w-12 h-12 rounded-full bg-[#2D9CFF]/20 border border-[#42E8FF]/30"
                        />
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={newName} 
                              onChange={(e) => setNewName(e.target.value)}
                              className="w-full glass-input text-white text-sm rounded px-2 py-1"
                            />
                          ) : (
                            <h3 className="font-headline font-bold text-white text-sm truncate">{profile.name}</h3>
                          )}
                          <p className="text-xs text-[#A0A7B5] truncate">{profile.email}</p>
                          {profile.mob_no && (
                            <p className="text-[11px] text-[#42E8FF] font-mono truncate">{profile.mob_no}</p>
                          )}
                        </div>
                        <button 
                          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                          className="p-1.5 rounded-full hover:bg-white/10 text-[#42E8FF] transition-colors"
                          disabled={isSaving}
                        >
                          {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Bio Field */}
                      <div className="text-xs text-[#A0A7B5]">
                        {isEditing ? (
                          <textarea 
                            value={newBio} 
                            onChange={(e) => setNewBio(e.target.value)}
                            rows={2}
                            className="w-full glass-input text-white text-xs rounded p-2 resize-none"
                          />
                        ) : (
                          <p className="italic">{profile.bio || "Member of Pulse of Profit community."}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation List */}
                  <nav className="space-y-1 mb-6">
                    <button 
                      onClick={() => setActivePanel('saved')} 
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Bookmark className="w-4 h-4 text-text-muted" />
                        <span>Saved Bulletins</span>
                      </div>
                      <span className="text-xs bg-black/5 dark:bg-white/10 text-text-muted px-2 py-0.5 rounded-full">
                        {savedPostIds.length}
                      </span>
                    </button>
                  </nav>

                </>
              )}

              {activePanel === 'saved' && (
                /* SAVED BULLETINS VIEW */
                <div className="space-y-4">
                  <h3 className="font-headline font-bold text-sm text-text-light dark:text-white border-b border-black/5 dark:border-white/5 pb-2">
                    Saved Bulletins
                  </h3>
                  <div className="space-y-2">
                    {posts.filter(p => savedPostIds.includes(p.id)).length === 0 ? (
                      <p className="text-xs text-text-muted text-center py-6 italic">No saved bulletins yet.</p>
                    ) : (
                      posts.filter(p => savedPostIds.includes(p.id)).map((p) => (
                        <div key={p.id} className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-start justify-between gap-2">
                          <button 
                            onClick={() => {
                              onClose();
                              router.push(`/posts/${p.id}`);
                            }}
                            className="flex-1 text-left"
                          >
                            <h4 className="font-semibold text-xs text-text-light dark:text-white hover:text-primary transition-colors line-clamp-1">{p.title}</h4>
                            <p className="text-[10px] text-text-muted mt-0.5">{p.author} • {p.date}</p>
                          </button>
                          <button
                            onClick={() => {
                              setSavedPostIds(savedPostIds.filter(id => id !== p.id));
                              showSidebarToast("Removed from saved");
                              addActivity(`Removed from saved: ${p.title}`);
                            }}
                            className="p-1 text-text-muted hover:text-red-400 transition-colors"
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activePanel === 'settings' && (
                /* SETTINGS VIEW */
                <div className="space-y-4">
                  <h3 className="font-headline font-bold text-sm text-text-light dark:text-white border-b border-black/5 dark:border-white/5 pb-2">
                    Preferences Settings
                  </h3>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-text-light dark:text-white">Email Alerts</div>
                        <p className="text-[10px] text-text-muted mt-0.5">Receive newsletter on publishing</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settingsNotify}
                        onChange={(e) => {
                          setSettingsNotify(e.target.checked);
                          showSidebarToast("Alert settings updated!");
                          addActivity(`Toggled email alerts: ${e.target.checked}`);
                        }}
                        className="w-4 h-4 accent-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-text-light dark:text-white">Weekly Digests</div>
                        <p className="text-[10px] text-text-muted mt-0.5">Get a curated weekend bulletin</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settingsDigest}
                        onChange={(e) => {
                          setSettingsDigest(e.target.checked);
                          showSidebarToast("Digest settings updated!");
                          addActivity(`Toggled weekly digests: ${e.target.checked}`);
                        }}
                        className="w-4 h-4 accent-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activePanel === 'support' && (
                /* SUPPORT VIEW */
                <div className="space-y-4">
                  <h3 className="font-headline font-bold text-sm text-text-light dark:text-white border-b border-black/5 dark:border-white/5 pb-2">
                    Helpdesk Support
                  </h3>
                  <form onSubmit={handleSupportSubmit} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-[10px] text-text-muted mb-1 uppercase font-semibold">How can we help?</label>
                      <textarea 
                        placeholder="Explain details of issues or bug reports here..."
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        required
                        rows={5}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/5 rounded-xl p-3 text-xs focus:outline-none focus:border-primary/50 resize-none text-text-light dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                    >
                      Submit Ticket
                    </button>
                  </form>
                </div>
              )}
        </div>

      </div>
    </>
  );
}
