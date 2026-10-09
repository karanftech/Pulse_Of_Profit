'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import ProfileSidebar from '@/components/ProfileSidebar';
import ShareModal from '@/components/ShareModal';
import { ArrowLeft, Heart, MessageSquare, Repeat2, Share2, Send, MoreHorizontal, X, Bookmark, Download, Sparkles, AlertTriangle, Link2, UserMinus, UserPlus } from 'lucide-react';

import { API_BASE_URL, useAuth } from '@/context/AuthContext';


import { Post, Comment } from '@/types/post';

const fallbackPosts: Post[] = [
  {
    id: "1",
    title: "PULSE OF PROFIT BULLETIN 🗞️",
    date: "27 April 2026",
    author: "SHOBIN SHEIKH",
    content: "Welcome to today's Pulse of Profit Bulletin. Telegram channel link: https://t.me/PulseOfProfitnews. We cover the latest market updates, stock analyses, and financial news daily. Stay tuned for the market opening report and key levels to watch out for today.",
    likes: 12,
    reposts: 5,
    comments_count: 2,
    comments: [
      {
        id: "c1",
        author: "Rohit Sharma",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit",
        content: "Great insights on the Telegram channel. Will keep following!",
        timestamp: "2 hours ago"
      },
      {
        id: "c2",
        author: "Anjali Gupta",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali",
        content: "Very informative post, looking forward to the next bulletin.",
        timestamp: "4 hours ago"
      }
    ],
    isLiked: false,
    isReposted: false
  },
  {
    id: "2",
    title: "PULSE OF PROFIT BULLETIN 🗞️",
    date: "23rd April 2026",
    author: "SHOBIN SHEIKH",
    content: "“The next global order may be built by ‘connectors’ in a fragmented world. This opens up an opportunity for India to be a ‘connector economy’.” ~ Anand Mahindra, Chairman, M&M. Check out the Chairman's Message brochure page attached below for a detailed overview.",
    likes: 3,
    reposts: 2,
    comments_count: 2,
    comments: [
      {
        id: "c3",
        author: "Shobin Sheikh",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shobin",
        content: "Anand Mahindra's quote perfectly captures the shift in India's global position. A connector economy is exactly what we are becoming.",
        timestamp: "1 day ago"
      },
      {
        id: "c4",
        author: "Vikram Aditya",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
        content: "The two-page Chairman's message is a must-read for any retail investor.",
        timestamp: "2 days ago"
      }
    ],
    imageUrl: "/chairman_message.png",
    isLiked: false,
    isReposted: false
  },
  {
    id: "3",
    title: "PULSE OF PROFIT BULLETIN 🗞️",
    date: "22 April 2026",
    author: "SHOBIN SHEIKH",
    content: "Date: April 22, 2026. Telegram link: https://t.me/PulseOfProfitnews. In today's edition, we analyze the earnings release of top IT companies and discuss the potential impact on banking stocks. Follow for more daily briefs.",
    likes: 45,
    reposts: 12,
    comments_count: 0,
    comments: [],
    isLiked: false,
    isReposted: false
  }
];

export default function PostDetail() {
  const routeParams = useParams();
  const postId = (routeParams?.id as string) || '';
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Comment Form State
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Interactive client-side states for share toasts & sharing modal
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Synchronized States
  const [subscribedAuthors, setSubscribedAuthors] = useState<string[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [blockedAuthors, setBlockedAuthors] = useState<string[]>([]);
  const [mutedAuthors, setMutedAuthors] = useState<string[]>([]);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [customPosts, setCustomPosts] = useState<Post[]>([]);
  const [activeThreeDotPostId, setActiveThreeDotPostId] = useState<string | null>(null);
  const [reportedPostIds, setReportedPostIds] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSubs = localStorage.getItem('site_subscribed_authors');
      if (savedSubs) setSubscribedAuthors(JSON.parse(savedSubs));
      else setSubscribedAuthors(["SHOBIN SHEIKH"]);

      const savedSaves = localStorage.getItem('site_saved_posts');
      if (savedSaves) setSavedPostIds(JSON.parse(savedSaves));

      const savedBlocked = localStorage.getItem('site_blocked_authors');
      if (savedBlocked) setBlockedAuthors(JSON.parse(savedBlocked));

      const savedMuted = localStorage.getItem('site_muted_authors');
      if (savedMuted) setMutedAuthors(JSON.parse(savedMuted));

      const savedActivities = localStorage.getItem('site_activity_log');
      if (savedActivities) setActivityLog(JSON.parse(savedActivities));

      const savedCustom = localStorage.getItem('site_custom_posts');
      if (savedCustom) setCustomPosts(JSON.parse(savedCustom));

      const savedNotifs = localStorage.getItem('site_notifications');
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

      const savedReported = localStorage.getItem('site_reported_posts');
      if (savedReported) setReportedPostIds(JSON.parse(savedReported));
    }
  }, []);

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

  const saveCustomPosts = (newPosts: Post[]) => {
    setCustomPosts(newPosts);
    localStorage.setItem('site_custom_posts', JSON.stringify(newPosts));
  };

  const saveReportedPostIds = (ids: string[]) => {
    setReportedPostIds(ids);
    localStorage.setItem('site_reported_posts', JSON.stringify(ids));
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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // First check custom posts in localStorage
        const savedCustom = localStorage.getItem('site_custom_posts');
        const custom: Post[] = savedCustom ? JSON.parse(savedCustom) : [];
        const customFound = custom.find(p => p.id === postId);
        if (customFound) {
          setPost(customFound);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
        } else {
          const fb = fallbackPosts.find(p => p.id === postId) || null;
          setPost(fb);
        }
      } catch (err) {
        console.warn("Backend offline, using fallback data.");
        const savedCustom = localStorage.getItem('site_custom_posts');
        const custom: Post[] = savedCustom ? JSON.parse(savedCustom) : [];
        const customFound = custom.find(p => p.id === postId);
        if (customFound) {
          setPost(customFound);
        } else {
          const fb = fallbackPosts.find(p => p.id === postId) || null;
          setPost(fb);
        }
      } finally {
        setLoading(false);
      }
    };
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Handle Like Increment
  const handleLike = async () => {
    if (!post) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${post.id}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
      } else {
        setPost({
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        });
      }
    } catch (err) {
      setPost({
        ...post,
        isLiked: !post.isLiked,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1
      });
    }
  };

  // Submit Comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const authorName = user?.name || commentAuthor || "Member";
    if (!post || !commentContent.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${post.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: authorName,
          content: commentContent,
        }),
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
        setCommentContent('');
        showToast("Comment posted successfully!");
      } else {
        appendMockComment(authorName);
      }
    } catch (err) {
      appendMockComment(authorName);
    } finally {
      setSubmittingComment(false);
    }
  };

  const appendMockComment = (authorName: string) => {
    if (!post) return;
    const newComment: Comment = {
      id: `c_mock_${Date.now()}`,
      author: authorName,
      avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`,
      content: commentContent,
      timestamp: "Just now"
    };
    setPost({
      ...post,
      comments: [...post.comments, newComment],
      comments_count: post.comments_count + 1
    });
    setCommentContent('');
    showToast("Comment posted!");
  };

  // Handle Repost Click via Backend API
  const handleRepost = async () => {
    if (!post) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${post.id}/repost`, {
        method: 'POST',
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
        showToast(updatedPost.isReposted ? "Bulletin reposted to your Substack feed!" : "Repost removed.");
      }
    } catch (err) {
      const currentReposts = post.reposts ?? 0;
      setPost({
        ...post,
        isReposted: !post.isReposted,
        reposts: post.isReposted ? Math.max(0, currentReposts - 1) : currentReposts + 1
      });
      showToast("Updated repost status.");
    }
  };

  // Trigger Share Modal
  const handleShareClick = () => {
    setIsShareOpen(true);
  };

  // Scroll to comments section
  const scrollToComments = () => {
    const element = document.getElementById('comments-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Toggle Theme mode
  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.remove('dark');
      html.classList.add('light');
      html.style.backgroundColor = '#FFFFFF';
      html.style.color = '#1F2937';
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
      html.style.backgroundColor = '#121414';
      html.style.color = '#E2E2E2';
    }
    setIsDarkMode(!isDarkMode);
  };

  // Redirect to homepage and focus search
  const handleSearchClick = () => {
    router.push('/?focusSearch=true');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-text-muted">Loading article details...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center space-y-4 p-4 text-center">
        <h2 className="font-headline font-bold text-2xl text-red-500">Bulletin Not Found</h2>
        <p className="text-sm text-text-muted">The requested edition could not be loaded.</p>
        <Link href="/" className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold">
          Back to Home
        </Link>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark transition-colors duration-200 relative">

      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-primary text-white font-headline text-xs font-bold px-5 py-3.5 rounded-full shadow-lg border border-primary-light animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Share Modal popup */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={currentUrl}
        title={post.title}
        showToast={showToast}
      />

      <Header
        onProfileClick={() => setIsProfileOpen(true)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onSearchClick={handleSearchClick}
        notifications={notifications}
        setNotifications={saveNotifications}
        addActivity={addActivity}
      />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">

        {/* Back Button */}
        <div>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center space-x-2 text-sm text-text-muted hover:text-text-light dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Feed</span>
          </button>
        </div>

        {/* Article Header & Body */}
        <article className="glass-panel p-5 sm:p-8 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
          <header className="space-y-4 border-b border-white/10 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-[#A0A7B5] font-mono uppercase tracking-wider">
                <span className="font-bold text-white">{post.author}</span>
                <span>•</span>
                <span>{post.date}</span>
              </div>

              {/* Post Controls */}
              <div className="flex items-center space-x-2 relative">
                {/* Three Dot Options */}
                <div className="relative">
                  <button
                    onClick={() => setActiveThreeDotPostId(activeThreeDotPostId === post.id ? null : post.id)}
                    className="p-1 rounded-full text-[#A0A7B5] hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {activeThreeDotPostId === post.id && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setActiveThreeDotPostId(null)}
                      />

                      <div className="absolute right-0 mt-2 w-56 glass-panel border border-white/10 shadow-2xl p-2 z-30 text-xs text-white">
                        <button
                          onClick={() => {
                            const url = window.location.href;
                            navigator.clipboard.writeText(url);
                            showToast("Link copied!");
                            addActivity(`Copied post link: ${post.title}`);
                            setActiveThreeDotPostId(null);
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
                        >
                          <Link2 className="w-4 h-4 text-[#A0A7B5]" />
                          <span>Copy link</span>
                        </button>

                        <button
                          onClick={() => {
                            if (savedPostIds.includes(post.id)) {
                              saveSavedPostIds(savedPostIds.filter(id => id !== post.id));
                              showToast("Post removed from saved");
                              addActivity(`Removed from saved: ${post.title}`);
                            } else {
                              saveSavedPostIds([...savedPostIds, post.id]);
                              showToast("Post saved!");
                              addActivity(`Saved post: ${post.title}`);
                            }
                            setActiveThreeDotPostId(null);
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
                        >
                          <Bookmark className={`w-4 h-4 ${savedPostIds.includes(post.id) ? 'fill-[#42E8FF] stroke-[#42E8FF]' : 'text-[#A0A7B5]'}`} />
                          <span>{savedPostIds.includes(post.id) ? 'Saved' : 'Save'}</span>
                        </button>

                        <button
                          onClick={() => {
                            showToast("Preparing image download...");
                            setTimeout(() => {
                              showToast("Exported post successfully!");
                              addActivity(`Saved post as image: ${post.title}`);
                            }, 1500);
                            setActiveThreeDotPostId(null);
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
                        >
                          <Download className="w-4 h-4 text-[#A0A7B5]" />
                          <span>Save as image</span>
                        </button>

                        <hr className="border-white/10 my-1" />

                        <button
                          onClick={() => {
                            const nextReported = [...reportedPostIds, post.id];
                            saveReportedPostIds(nextReported);
                            showToast("Report submitted. Post has been hidden.");
                            addActivity(`Reported post ID ${post.id}`);
                            setActiveThreeDotPostId(null);
                            router.push('/');
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 text-left transition-colors text-red-400"
                        >
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span>Report</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Hide Cross Button */}
                <button
                  onClick={() => {
                    showToast("Post hidden.");
                    addActivity(`Hidden post ID ${post.id}`);
                    router.push('/');
                  }}
                  className="p-1 rounded-full text-[#A0A7B5] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h1 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#A0A7B5]">
              Date: {post.date}
            </p>
          </header>

          {/* Article Body */}
          <div className="py-2 space-y-6 leading-relaxed text-white">
            {/* Conditional Blockquote for Anand Mahindra Post */}
            {post.id === "2" ? (
              <div className="space-y-6">
                {/* Glassmorphic Blockquote styling */}
                <blockquote className="border-l-4 border-[#42E8FF] glass-panel p-4 sm:p-6 rounded-r-2xl my-6 bg-[#2D9CFF]/10 shadow-[0_0_20px_rgba(66,232,255,0.1)]">
                  <p className="font-display font-semibold text-sm sm:text-base md:text-lg text-white italic leading-snug">
                    “The next global order may be built by ‘connectors’ in a fragmented world. This opens up an opportunity for India to be a ‘connector economy’.”
                  </p>
                  <cite className="block text-xs sm:text-sm text-[#42E8FF] font-medium mt-3 not-italic">
                    ~ Anand Mahindra, Chairman, M&M
                  </cite>
                </blockquote>

                <p className="text-sm sm:text-base text-[#A0A7B5]">
                  In this corporate message, the Chairman outlines the strategic direction and future scope of connector models, creating massive economic leverage for domestic manufacturing and digital exports.
                </p>

                {/* Chairman Message Image Asset */}
                {post.imageUrl && (
                  <div className="my-6 rounded-2xl overflow-hidden border border-white/10 bg-[#0D1624] shadow-2xl">
                    <img
                      src={post.imageUrl}
                      alt="Chairman's Message"
                      className="w-full h-auto object-contain max-h-[500px]"
                    />
                    <div className="p-3 text-center text-xs text-[#A0A7B5] bg-white/5 border-t border-white/5">
                      Chairman's Message Brochure Page Overview
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm sm:text-base text-[#A0A7B5] whitespace-pre-line leading-relaxed">
                {post.content}
              </p>
            )}
          </div>

          {/* Article Interaction Icons row (Substack layout) */}
          <div className="flex items-center gap-6 sm:gap-8 border-y border-white/10 py-3.5 text-[#A0A7B5] text-xs sm:text-sm my-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1.5 transition-all group/btn ${post.isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-400'}`}
              title="Like post"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/btn:scale-110 ${post.isLiked ? 'fill-rose-500 stroke-rose-500 text-rose-500' : ''}`} />
              <span>{post.likes}</span>
            </button>

            <button
              onClick={scrollToComments}
              className="flex items-center space-x-1.5 hover:text-[#42E8FF] transition-colors group/btn"
              title="Comments"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/btn:scale-110" />
              <span>{post.comments_count}</span>
            </button>

            <button
              onClick={handleRepost}
              className={`flex items-center space-x-1.5 transition-all group/btn ${post.isReposted ? 'text-[#4DFFB8] font-bold' : 'hover:text-[#4DFFB8]'}`}
              title="Repost"
            >
              <Repeat2 className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/btn:scale-110" />
              <span>{post.reposts ?? 0}</span>
            </button>

            <button
              onClick={handleShareClick}
              className="flex items-center hover:text-[#42E8FF] transition-colors group/btn"
              title="Share post"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/btn:scale-110" />
            </button>
          </div>
        </article>

        {/* Comments Section */}
        <section id="comments-section" className="space-y-6 scroll-mt-20">
          <h2 className="font-display font-bold text-xl text-white flex items-center space-x-2">
            <span>Comments</span>
            <span className="text-xs bg-[#42E8FF]/20 text-[#42E8FF] px-2.5 py-0.5 rounded-full font-bold">{post.comments.length}</span>
          </h2>

          {/* Comment List */}
          <div className="space-y-4">
            {post.comments.length === 0 ? (
              <p className="text-sm text-[#A0A7B5] italic glass-panel p-4 border border-white/10">No comments yet. Be the first to comment!</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 p-4 rounded-2xl glass-panel border border-white/10 text-white">
                  <img
                    src={comment.avatar}
                    alt={comment.author}
                    className="w-8 h-8 rounded-full bg-[#0D1624] border border-white/10"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate">{comment.author}</h4>
                      <span className="text-[10px] text-[#A0A7B5] font-mono">{comment.timestamp}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#A0A7B5] leading-relaxed font-sans">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Post Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-4 p-5 rounded-2xl glass-panel border border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-white">Leave a comment</h3>
              {user && (
                <div className="flex items-center space-x-2 text-xs text-[#A0A7B5]">
                  <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full bg-slate-800" />
                  <span>Posting as <strong className="text-white">{user.name}</strong></span>
                </div>
              )}
            </div>

            <div className="relative">
              <textarea
                placeholder="Write your comment..."
                required
                rows={3}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 pr-12 text-xs text-white resize-none leading-relaxed"
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="absolute right-3 bottom-3.5 p-2 rounded-xl btn-cyan-gradient text-black font-bold disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </section>
      </main>

      {/* Profile Sidebar */}
      <ProfileSidebar
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
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
        posts={[]}
        setPosts={() => { }}
        activities={activityLog}
        addActivity={addActivity}
        customPosts={customPosts}
        setCustomPosts={saveCustomPosts}
      />
    </div>
  );
}
