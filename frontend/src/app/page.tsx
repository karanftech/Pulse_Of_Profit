'use client';

import React, { useState, useEffect } from 'react';
import PinnedPost from '@/components/PinnedPost';
import Feed from '@/components/Feed';
import ProfileSidebar from '@/components/ProfileSidebar';
import LandingPage from '@/components/LandingPage';
import FeedSidebar from '@/components/FeedSidebar';
import FeedRightRail from '@/components/FeedRightRail';
import { ChevronDown, Newspaper } from 'lucide-react';

import { API_BASE_URL, useAuth } from '@/context/AuthContext';

import { Post, Comment } from '@/types/post';

// Fallback mock posts if backend is offline
const fallbackPosts: Post[] = [
  {
    id: "1",
    title: "PULSE OF PROFIT BULLETIN 🗞️",
    date: "27 April 2026",
    author: "SHOBIN SHEIKH",
    content: "Welcome to today's Pulse of Profit Bulletin. Telegram channel link: https://t.me/PulseOfProfitnews. We cover the latest market updates, stock analyses, and financial news daily.",
    likes: 12,
    comments_count: 2,
    comments: [],
    isLiked: false
  },
  {
    id: "2",
    title: "PULSE OF PROFIT BULLETIN 🗞️",
    date: "23rd April 2026",
    author: "SHOBIN SHEIKH",
    content: "“The next global order may be built by ‘connectors’ in a fragmented world. This opens up an opportunity for India to be a ‘connector economy’.” ~ Anand Mahindra, Chairman, M&M. Check out the Chairman's Message brochure page attached below for a detailed overview.",
    likes: 3,
    comments_count: 2,
    comments: [],
    imageUrl: "/chairman_message.png",
    isLiked: false
  },
  {
    id: "3",
    title: "PULSE OF PROFIT BULLETIN 🗞️",
    date: "22 April 2026",
    author: "SHOBIN SHEIKH",
    content: "Date: April 22, 2026. Telegram link: https://t.me/PulseOfProfitnews. In today's edition, we analyze the earnings release of top IT companies and discuss the potential impact on banking stocks.",
    likes: 45,
    comments_count: 0,
    comments: [],
    isLiked: false
  }
];

export default function Home() {
  const { user, token, isLoadingAuth, isLandingPageVisible, dismissLandingPage, openAuthModal } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profilePanel, setProfilePanel] = useState<'main' | 'settings' | 'support'>('main');

  // Synchronized States
  const [subscribedAuthors, setSubscribedAuthors] = useState<string[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [blockedAuthors, setBlockedAuthors] = useState<string[]>([]);
  const [mutedAuthors, setMutedAuthors] = useState<string[]>([]);
  const [customPosts, setCustomPosts] = useState<Post[]>([]);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [reportedPostIds, setReportedPostIds] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSubs = localStorage.getItem('site_subscribed_authors');
      if (savedSubs) setSubscribedAuthors(JSON.parse(savedSubs));
      else {
        const defaultSubs = ["SHOBIN SHEIKH"];
        setSubscribedAuthors(defaultSubs);
        localStorage.setItem('site_subscribed_authors', JSON.stringify(defaultSubs));
      }

      const savedSaves = localStorage.getItem('site_saved_posts');
      if (savedSaves) setSavedPostIds(JSON.parse(savedSaves));

      const savedBlocked = localStorage.getItem('site_blocked_authors');
      if (savedBlocked) setBlockedAuthors(JSON.parse(savedBlocked));

      const savedMuted = localStorage.getItem('site_muted_authors');
      if (savedMuted) setMutedAuthors(JSON.parse(savedMuted));

      const savedReported = localStorage.getItem('site_reported_posts');
      if (savedReported) setReportedPostIds(JSON.parse(savedReported));

      const savedCustom = localStorage.getItem('site_custom_posts');
      if (savedCustom) setCustomPosts(JSON.parse(savedCustom));

      const savedActivities = localStorage.getItem('site_activity_log');
      if (savedActivities) setActivityLog(JSON.parse(savedActivities));
      else {
        const defaultActivities = ["Project setup completed", "Welcome to Daily Bulletin!"];
        setActivityLog(defaultActivities);
        localStorage.setItem('site_activity_log', JSON.stringify(defaultActivities));
      }

      const savedNotifs = localStorage.getItem('site_notifications');
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      } else {
        const defaultNotifs = [
          {
            id: "n1",
            title: "New Bulletin Published 🗞️",
            message: "Jayant Mundhra published: Data as proof - WHY ethanol blending will only rise...",
            time: "10 mins ago",
            read: false,
            postId: "2"
          },
          {
            id: "n2",
            title: "Welcome to Daily Bulletin! 🎉",
            message: "Subscribe to authors to get latest updates in your feed.",
            time: "1 hour ago",
            read: false
          },
          {
            id: "n3",
            title: "Trending Post 🔥",
            message: "Michael Burry's post about housing market is trending on Pulse of Profit.",
            time: "2 hours ago",
            read: true,
            postId: "3"
          }
        ];
        setNotifications(defaultNotifs);
        localStorage.setItem('site_notifications', JSON.stringify(defaultNotifs));
      }
    }
  }, []);

  // Save Helper Wrappers
  const saveSubscribedAuthors = (authors: string[]) => {
    setSubscribedAuthors(authors);
    localStorage.setItem('site_subscribed_authors', JSON.stringify(authors));
  };

  const saveSavedPostIds = (ids: string[]) => {
    setSavedPostIds(ids);
    localStorage.setItem('site_saved_posts', JSON.stringify(ids));
  };

  const saveBlockedAuthors = (authors: string[]) => {
    setBlockedAuthors(authors);
    localStorage.setItem('site_blocked_authors', JSON.stringify(authors));
  };

  const saveMutedAuthors = (authors: string[]) => {
    setMutedAuthors(authors);
    localStorage.setItem('site_muted_authors', JSON.stringify(authors));
  };

  const saveReportedPostIds = (ids: string[]) => {
    setReportedPostIds(ids);
    localStorage.setItem('site_reported_posts', JSON.stringify(ids));
  };

  const saveCustomPosts = (newPosts: Post[]) => {
    setCustomPosts(newPosts);
    localStorage.setItem('site_custom_posts', JSON.stringify(newPosts));
  };

  const addActivity = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logEntry = `[${timestamp}] ${msg}`;
    setActivityLog(prev => {
      const nextLog = [logEntry, ...prev];
      localStorage.setItem('site_activity_log', JSON.stringify(nextLog));
      return nextLog;
    });
  };

  const saveNotifications = (newNotifs: any[]) => {
    setNotifications(newNotifs);
    localStorage.setItem('site_notifications', JSON.stringify(newNotifs));
  };

  // Fetch posts from FastAPI Backend
  useEffect(() => {
    const loadPosts = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        
        const res = await fetch(`${API_BASE_URL}/api/posts`, {
          signal: controller.signal,
          headers: { 'Authorization': `Bearer ${token}` }
        });
        clearTimeout(timeoutId);

        let basePosts: Post[] = [];
        if (res.ok) {
          basePosts = await res.json();
        } else {
          basePosts = fallbackPosts;
        }

        const savedCustom = localStorage.getItem('site_custom_posts');
        const custom = savedCustom ? JSON.parse(savedCustom) : [];
        
        const merged = [...custom, ...basePosts];
        setPosts(merged);
      } catch (err) {
        console.warn("Backend offline or request timed out, using fallback mock data.");
        const savedCustom = localStorage.getItem('site_custom_posts');
        const custom = savedCustom ? JSON.parse(savedCustom) : [];
        setPosts([...custom, ...fallbackPosts]);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, [customPosts.length, token]);

  // Focus the bulletin feed from Explore/search shortcuts.
  const handleSearchClick = () => {
    document.getElementById('bulletins-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Pinned post (ID 1)
  const pinnedPost = posts.find(p => p.id === "1") || fallbackPosts[0];

  const canAccessFeed = Boolean(user) && !isLoadingAuth;
  if (!canAccessFeed || isLandingPageVisible) {
    return (
      <LandingPage
        onExplore={canAccessFeed ? dismissLandingPage : () => openAuthModal('login')}
        onSignIn={canAccessFeed ? dismissLandingPage : () => openAuthModal('register')}
      />
    );
  }

  return (
    <div id="top" className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#42E8FF] selection:text-black">
      <div className="mx-auto grid min-h-screen w-full grid-cols-1 gap-6 px-4 xl:grid-cols-[220px_minmax(0,1fr)_320px] xl:justify-between 2xl:grid-cols-[250px_710px_465px] 2xl:gap-5 2xl:px-8">
        <FeedSidebar
          notifications={notifications}
          setNotifications={saveNotifications}
          onProfileClick={() => { setProfilePanel('main'); setIsProfileOpen(true); }}
          onExploreClick={handleSearchClick}
          onSettingsClick={() => { setProfilePanel('settings'); setIsProfileOpen(true); }}
          onSupportClick={() => { setProfilePanel('support'); setIsProfileOpen(true); }}
          onSearchClick={handleSearchClick}
          addActivity={addActivity}
        />

        <FeedRightRail onSearchClick={handleSearchClick} />

      {/* NEWS & RESEARCH (PULSE OF PROFIT BULLETINS FEED) */}
      <section id="bulletins-feed" className="w-full min-w-0 pb-28 pt-2 xl:col-start-2 xl:row-start-1 xl:py-7">
        
        {/* Feed Title */}
        <div className="mb-3 flex items-center gap-1 text-sm text-slate-400 xl:hidden">
          <span>For you</span>
          <ChevronDown className="h-4 w-4" />
        </div>
        <div className="mb-6 hidden flex-col space-y-2 sm:mb-8 xl:flex">
          <div className="inline-flex items-center space-x-2 text-[11px] sm:text-xs font-semibold text-[#42E8FF] uppercase tracking-wider">
            <Newspaper className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#42E8FF]" />
            <span>Pulse of Profit Bulletins</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">News & Research Bulletins Feed</h2>
          <p className="text-xs sm:text-sm text-[#A0A7B5]">Daily market intelligence notes, stock breakdowns, and analyst dispatches.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-8 h-8 border-4 border-[#42E8FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-[#A0A7B5]">Loading Pulse of Profit Telemetry...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned Featured Bulletin */}
            {pinnedPost && !blockedAuthors.includes(pinnedPost.author) && !mutedAuthors.includes(pinnedPost.author) && (
              <div className="hidden xl:block">
              <PinnedPost 
                id={pinnedPost.id}
                title={pinnedPost.title}
                date={pinnedPost.date}
                content={pinnedPost.content}
                telegramUrl="https://t.me/PulseOfProfitnews"
              />
              </div>
            )}

            {/* Main Interactive Feed */}
            <Feed 
              posts={posts} 
              setPosts={setPosts} 
              apiBaseUrl={API_BASE_URL}
              subscribedAuthors={subscribedAuthors}
              setSubscribedAuthors={saveSubscribedAuthors}
              savedPostIds={savedPostIds}
              setSavedPostIds={saveSavedPostIds}
              blockedAuthors={blockedAuthors}
              setBlockedAuthors={saveBlockedAuthors}
              mutedAuthors={mutedAuthors}
              setMutedAuthors={saveMutedAuthors}
              reportedPostIds={reportedPostIds}
              setReportedPostIds={saveReportedPostIds}
              addActivity={addActivity}
            />
          </div>
        )}
      </section>

      </div>

      {/* PROFILE SIDEBAR DRAWER */}
      <ProfileSidebar 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        initialPanel={profilePanel}
        apiBaseUrl={API_BASE_URL} 
        subscribedAuthors={subscribedAuthors}
        setSubscribedAuthors={saveSubscribedAuthors}
        savedPostIds={savedPostIds}
        setSavedPostIds={saveSavedPostIds}
        blockedAuthors={blockedAuthors}
        setBlockedAuthors={saveBlockedAuthors}
        mutedAuthors={mutedAuthors}
        setMutedAuthors={saveMutedAuthors}
        reportedPostIds={reportedPostIds}
        setReportedPostIds={saveReportedPostIds}
        posts={posts}
        setPosts={setPosts}
        activities={activityLog}
        addActivity={addActivity}
        customPosts={customPosts}
        setCustomPosts={saveCustomPosts}
      />
    </div>
  );
}
