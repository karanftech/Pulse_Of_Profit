'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  MessageSquare, 
  Repeat2, 
  Share2, 
  MoreHorizontal, 
  X, 
  Link2, 
  UserMinus, 
  UserPlus, 
  Bookmark, 
  Download, 
  Sparkles,
  AlertTriangle,
  Send
} from 'lucide-react';
import ShareModal from '@/components/ShareModal';
import { useAuth } from '../context/AuthContext';

import { Post, Comment } from '@/types/post';

interface FeedProps {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  apiBaseUrl: string;
  subscribedAuthors: string[];
  setSubscribedAuthors: (authors: string[]) => void;
  savedPostIds: string[];
  setSavedPostIds: (ids: string[]) => void;
  blockedAuthors: string[];
  setBlockedAuthors: (authors: string[]) => void;
  mutedAuthors: string[];
  setMutedAuthors: (authors: string[]) => void;
  addActivity: (message: string) => void;
  reportedPostIds: string[];
  setReportedPostIds: (ids: string[]) => void;
}

export default function Feed({ 
  posts, 
  setPosts, 
  apiBaseUrl,
  subscribedAuthors,
  setSubscribedAuthors,
  savedPostIds,
  setSavedPostIds,
  blockedAuthors,
  setBlockedAuthors,
  mutedAuthors,
  setMutedAuthors,
  addActivity,
  reportedPostIds,
  setReportedPostIds
}: FeedProps) {
  const router = useRouter();
  const { token, openAuthModal } = useAuth();
  
  // Interactive UI states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareTitle, setShareTitle] = useState('');

  // Bell, Cross & Dot states
  const [activeThreeDotPostId, setActiveThreeDotPostId] = useState<string | null>(null);
  const [hiddenPostIds, setHiddenPostIds] = useState<Record<string, boolean>>({});
  const [hiddenReasons, setHiddenReasons] = useState<Record<string, string>>({});
  const [aiScanningPostId, setAiScanningPostId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Like Increment
  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`${apiBaseUrl}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map(p => p.id === postId ? updatedPost : p));
      } else {
        toggleLikeFallback(postId);
      }
    } catch (err) {
      toggleLikeFallback(postId);
    }
  };

  const toggleLikeFallback = (postId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.isLiked;
        addActivity(nextLiked ? `Liked post: ${p.title}` : `Unliked post: ${p.title}`);
        return {
          ...p,
          isLiked: nextLiked,
          likes: nextLiked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));
  };

  // Handle Repost via API
  const handleRepost = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`${apiBaseUrl}/api/posts/${postId}/repost`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map(p => p.id === postId ? updatedPost : p));
        showToast(updatedPost.isReposted ? "Bulletin reposted!" : "Repost removed.");
        addActivity(updatedPost.isReposted ? `Reposted: ${updatedPost.title}` : `Removed repost: ${updatedPost.title}`);
      } else {
        toggleRepostFallback(postId);
      }
    } catch (err) {
      toggleRepostFallback(postId);
    }
  };

  const toggleRepostFallback = (postId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const nextReposted = !p.isReposted;
        showToast(nextReposted ? "Bulletin reposted!" : "Repost removed.");
        addActivity(nextReposted ? `Reposted: ${p.title}` : `Removed repost: ${p.title}`);
        return {
          ...p,
          isReposted: nextReposted,
          reposts: nextReposted ? (p.reposts || 0) + 1 : Math.max(0, (p.reposts || 0) - 1)
        };
      }
      return p;
    }));
  };

  // Trigger custom Share Modal
  const handleShareClick = (post: Post, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${post.id}`;
    setShareUrl(url);
    setShareTitle(post.title);
    setIsShareOpen(true);
  };

  // Handle Comments Click
  const handleCommentsClick = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/posts/${postId}#comments-section`);
  };

  // Handle Card Click
  const handleCardClick = (postId: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('.z-30') || target.closest('.z-20')) {
      return;
    }
    router.push(`/posts/${postId}`);
  };

  // Subscribe / Unsubscribe Toggle
  const handleSubscribeToggle = (author: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (subscribedAuthors.includes(author)) {
      const nextSubs = subscribedAuthors.filter(a => a !== author);
      setSubscribedAuthors(nextSubs);
      showToast(`Unsubscribed from ${author}`);
      addActivity(`Unsubscribed from ${author}`);
    } else {
      const nextSubs = [...subscribedAuthors, author];
      setSubscribedAuthors(nextSubs);
      showToast(`Subscribed to ${author}!`);
      addActivity(`Subscribed to ${author}`);
    }
    setActiveThreeDotPostId(null);
  };

  // Three Dot Click
  const handleThreeDotClick = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveThreeDotPostId(activeThreeDotPostId === postId ? null : postId);
  };

  // Option: Copy Link
  const handleOptionCopyLink = (post: Post, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard!");
    addActivity(`Copied link for post: ${post.title}`);
    setActiveThreeDotPostId(null);
  };

  // Option: Save
  const handleOptionSave = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (savedPostIds.includes(postId)) {
      setSavedPostIds(savedPostIds.filter(id => id !== postId));
      showToast("Removed post from saved list.");
      addActivity(`Unsaved post ID ${postId}`);
    } else {
      setSavedPostIds([...savedPostIds, postId]);
      showToast("Post saved to your profile!");
      addActivity(`Saved post ID ${postId}`);
    }
    setActiveThreeDotPostId(null);
  };

  // Option: Save as Image
  const handleOptionSaveAsImage = (post: Post, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveThreeDotPostId(null);
    showToast(`Generated image card for "${post.title}"!`);
    addActivity(`Saved post "${post.title}" as image`);
  };

  // Option: Hide
  const handleOptionHide = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHiddenPostIds(prev => ({ ...prev, [postId]: true }));
    addActivity(`Hidden post ID ${postId}`);
    setActiveThreeDotPostId(null);
  };

  // Option: Mute
  const handleOptionMute = (author: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMutedAuthors([...mutedAuthors, author]);
    showToast(`Muted all posts from ${author}`);
    addActivity(`Muted ${author}`);
    setActiveThreeDotPostId(null);
  };

  // Option: Block
  const handleOptionBlock = (author: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBlockedAuthors([...blockedAuthors, author]);
    showToast(`Blocked ${author}`);
    addActivity(`Blocked ${author}`);
    setActiveThreeDotPostId(null);
  };

  // Option: Report
  const handleOptionReport = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReportedPostIds([...reportedPostIds, postId]);
    showToast("Report submitted. Post hidden.");
    addActivity(`Reported post ID ${postId}`);
    setActiveThreeDotPostId(null);
  };

  // Cross Click
  const handleCrossClick = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHiddenPostIds(prev => ({ ...prev, [postId]: true }));
    addActivity(`Hidden post ID ${postId}`);
  };

  // Undo Hide
  const handleUndoHide = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHiddenPostIds(prev => ({ ...prev, [postId]: false }));
    setHiddenReasons(prev => ({ ...prev, [postId]: '' }));
    addActivity(`Undid hide on post ID ${postId}`);
  };

  // Reason Select
  const handleReasonSelect = (postId: string, reason: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHiddenReasons(prev => ({ ...prev, [postId]: reason }));
    showToast(`Feedback submitted: "${reason}". Thank you!`);
    addActivity(`Submitted hide reason for post ID ${postId}: ${reason}`);
  };

  const visiblePosts = posts.filter(post => 
    !blockedAuthors.includes(post.author) && 
    !mutedAuthors.includes(post.author) &&
    !reportedPostIds.includes(post.id) &&
    (
      post.author.toUpperCase().includes('SHOBIN') ||
      post.author.toUpperCase().includes('ADMIN') ||
      post.author.toUpperCase().includes('PULSE') ||
      post.title.toUpperCase().includes('BULLETIN')
    )
  );

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 btn-cyan-gradient text-black font-display text-xs font-bold px-6 py-3.5 rounded-full shadow-[0_0_25px_rgba(66,232,255,0.6)] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Share Modal */}
      <ShareModal 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        url={shareUrl} 
        title={shareTitle} 
        showToast={showToast} 
      />

      {/* AI Scanning Alert */}
      {aiScanningPostId && (
        <div className="p-4 rounded-[20px] bg-[#2D9CFF]/10 border border-[#42E8FF]/30 flex items-center space-x-3 text-xs text-[#42E8FF] font-medium animate-pulse">
          <Sparkles className="w-4 h-4 animate-spin text-[#42E8FF]" />
          <span>Scanning content with Pulse of Profit AI detector... Please hold.</span>
        </div>
      )}

      {/* Bulletins Feed List */}
      <div className="space-y-6">
        {visiblePosts.length === 0 ? (
          <div className="text-center py-12 text-[#A0A7B5] text-sm glass-panel border border-white/10">
            No bulletins found matching your criteria.
          </div>
        ) : (
          visiblePosts.map((post) => {
            if (hiddenPostIds[post.id]) {
              return (
                <div 
                  key={post.id} 
                  className="rounded-[20px] glass-panel border border-white/10 p-6 space-y-4 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-sm text-white">
                        We'll show you less like this.
                      </h4>
                      <p className="text-xs text-[#A0A7B5] mt-0.5">
                        Please select feedback below
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={(e) => handleUndoHide(post.id, e)}
                        className="px-4 py-1.5 bg-[#0D1624] hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all text-[#42E8FF]"
                      >
                        Undo
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {[
                      "Not interesting",
                      "Slop",
                      "Clickbait",
                      "Spam",
                      "Shilling",
                      "Other..."
                    ].map((reason) => (
                      <button
                        key={reason}
                        onClick={(e) => handleReasonSelect(post.id, reason, e)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          hiddenReasons[post.id] === reason
                            ? 'btn-cyan-gradient'
                            : 'bg-[#0D1624] text-[#A0A7B5] border-white/10 hover:text-white'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={post.id} 
                id={`post-card-${post.id}`}
                onClick={(e) => handleCardClick(post.id, e)}
                className="block rounded-[20px] glass-panel glass-panel-hover p-6 border border-white/10 transition-all duration-200 cursor-pointer group text-white relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Meta Details & Action Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-[#A0A7B5]">
                      <span className="font-bold text-white uppercase tracking-wider">{post.author}</span>
                      <span>•</span>
                      <span className="font-mono">{post.date}</span>
                    </div>

                    <div className="flex items-center space-x-2 relative z-10">
                      {/* Dropdown Options */}
                      <div className="relative">
                        <button
                          onClick={(e) => handleThreeDotClick(post.id, e)}
                          className="p-1.5 rounded-full text-[#A0A7B5] hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {activeThreeDotPostId === post.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-20"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setActiveThreeDotPostId(null);
                              }}
                            />
                            
                            <div className="absolute right-0 mt-2 w-56 glass-panel border border-white/10 shadow-2xl p-2 z-30 text-xs text-white">
                              <button
                                onClick={(e) => handleOptionCopyLink(post, e)}
                                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
                              >
                                <Link2 className="w-4 h-4 text-[#A0A7B5]" />
                                <span>Copy link</span>
                              </button>

                              <button
                                onClick={(e) => handleOptionSave(post.id, e)}
                                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
                              >
                                <Bookmark className={`w-4 h-4 ${savedPostIds.includes(post.id) ? 'fill-[#42E8FF] stroke-[#42E8FF]' : 'text-[#A0A7B5]'}`} />
                                <span>{savedPostIds.includes(post.id) ? 'Saved' : 'Save'}</span>
                              </button>

                              <button
                                onClick={(e) => handleOptionSaveAsImage(post, e)}
                                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
                              >
                                <Download className="w-4 h-4 text-[#A0A7B5]" />
                                <span>Save as image</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Hide Button */}
                      <button
                        onClick={(e) => handleCrossClick(post.id, e)}
                        className="p-1.5 rounded-full text-[#A0A7B5] hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content Header & Body */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="font-display font-bold text-base sm:text-lg md:text-xl text-white group-hover:text-[#42E8FF] transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-mono text-[#A0A7B5]">
                      Published: {post.date}
                    </p>
                    <p className="text-xs sm:text-sm text-[#A0A7B5] line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Attached Media (Photos / Videos) */}
                  {((post.mediaUrls && post.mediaUrls.length > 0) || post.imageUrl) && (
                    <div className="space-y-2 mt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl">
                        {(post.mediaUrls && post.mediaUrls.length > 0 
                          ? post.mediaUrls 
                          : [post.imageUrl!]
                        ).map((media, idx) => {
                          const fullUrl = media.startsWith('/') ? `${apiBaseUrl}${media}` : media;
                          const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(media);

                          return (
                            <div key={idx} className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0D1624] aspect-[16/9] w-full">
                              {isVideo ? (
                                <video 
                                  src={fullUrl} 
                                  controls 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <img 
                                  src={fullUrl} 
                                  alt={`Bulletin Media ${idx + 1}`}
                                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Bar (Substack layout: left aligned, clean gap) */}
                  <div className="flex items-center gap-6 sm:gap-8 border-t border-white/10 pt-3.5 mt-2 text-[#A0A7B5] text-xs font-medium">
                    {/* Like Button */}
                    <button 
                      onClick={(e) => handleLike(post.id, e)}
                      className={`flex items-center space-x-1.5 transition-all group/btn ${
                        post.isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-400'
                      }`}
                      title="Like post"
                    >
                      <Heart className={`w-4 h-4 transition-transform group-hover/btn:scale-110 ${post.isLiked ? 'fill-rose-500 stroke-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes}</span>
                    </button>

                    {/* Comment Button */}
                    <button 
                      onClick={(e) => handleCommentsClick(post.id, e)}
                      className="flex items-center space-x-1.5 hover:text-[#42E8FF] transition-colors group/btn"
                      title="Comments"
                    >
                      <MessageSquare className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                      <span>{post.comments_count}</span>
                    </button>

                    {/* Repost Button */}
                    <button 
                      onClick={(e) => handleRepost(post.id, e)}
                      className={`flex items-center space-x-1.5 transition-all group/btn ${
                        post.isReposted ? 'text-[#4DFFB8] font-bold' : 'hover:text-[#4DFFB8]'
                      }`}
                      title="Repost"
                    >
                      <Repeat2 className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                      <span>{post.reposts || 0}</span>
                    </button>

                    {/* Share Button */}
                    <button 
                      onClick={(e) => handleShareClick(post, e)}
                      className="flex items-center hover:text-[#42E8FF] transition-colors group/btn ml-auto sm:ml-0"
                      title="Share post"
                    >
                      <Share2 className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
