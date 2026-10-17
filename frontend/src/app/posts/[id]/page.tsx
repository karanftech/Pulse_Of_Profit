'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, UserRound } from 'lucide-react';
import { API_BASE_URL, useAuth } from '@/context/AuthContext';
import { getPostBlockMediaUrls, getPostContentBlocks, Post } from '@/types/post';

const fallbackPosts: Post[] = [
  {
    id: '1',
    title: 'PULSE OF PROFIT BULLETIN 🗞️',
    date: '27 April 2026',
    author: 'SHOBIN SHEIKH',
    content: "Welcome to today's Pulse of Profit Bulletin. Telegram channel link: https://t.me/PulseOfProfitnews. We cover the latest market updates, stock analyses, and financial news daily. Stay tuned for the market opening report and key levels to watch out for today.",
    likes: 12,
    reposts: 5,
    comments_count: 0,
    comments: [],
  },
  {
    id: '2',
    title: 'PULSE OF PROFIT BULLETIN 🗞️',
    date: '23rd April 2026',
    author: 'SHOBIN SHEIKH',
    content: "“The next global order may be built by ‘connectors’ in a fragmented world. This opens up an opportunity for India to be a ‘connector economy’.” ~ Anand Mahindra, Chairman, M&M. Check out the Chairman's Message brochure page attached below for a detailed overview.",
    likes: 3,
    reposts: 2,
    comments_count: 0,
    comments: [],
    imageUrl: '/chairman_message.png',
  },
  {
    id: '3',
    title: 'PULSE OF PROFIT BULLETIN 🗞️',
    date: '22 April 2026',
    author: 'SHOBIN SHEIKH',
    content: "Date: April 22, 2026. Telegram link: https://t.me/PulseOfProfitnews. In today's edition, we analyze the earnings release of top IT companies and discuss the potential impact on banking stocks. Follow for more daily briefs.",
    likes: 45,
    reposts: 12,
    comments_count: 0,
    comments: [],
  },
];

export default function PostDetail() {
  const routeParams = useParams();
  const postId = (routeParams?.id as string) || '';
  const { token, user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleSubmitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!post || !token || !commentText.trim()) return;

    setIsSubmittingComment(true);
    setCommentError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${post.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ author: user?.name || 'User', content: commentText.trim() }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Could not add your comment.');
      }
      setPost(await response.json());
      setCommentText('');
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : 'Could not add your comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      try {
        const savedCustom = localStorage.getItem('site_custom_posts');
        const customPosts: Post[] = savedCustom ? JSON.parse(savedCustom) : [];
        const customPost = customPosts.find((item) => item.id === postId);
        if (customPost) {
          if (!cancelled) setPost(customPost);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data: Post = await response.json();
          if (!cancelled) setPost(data);
        } else if (!cancelled) {
          setPost(fallbackPosts.find((item) => item.id === postId) || null);
        }
      } catch {
        const savedCustom = localStorage.getItem('site_custom_posts');
        const customPosts: Post[] = savedCustom ? JSON.parse(savedCustom) : [];
        const customPost = customPosts.find((item) => item.id === postId);
        if (!cancelled) setPost(customPost || fallbackPosts.find((item) => item.id === postId) || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (postId) fetchPost();
    else setLoading(false);

    return () => { cancelled = true; };
  }, [postId, token]);

  useEffect(() => {
    if (!post || window.location.hash !== '#comments-section') return;
    requestAnimationFrame(() => {
      document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [post]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05080d] text-slate-300">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#42E8FF] border-t-transparent" />
          Loading bulletin...
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#05080d] px-5 text-center text-white">
        <h1 className="text-2xl font-bold">Bulletin not found</h1>
        <p className="text-sm text-slate-400">This bulletin could not be loaded.</p>
        <Link href="/" className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15">Back to bulletins</Link>
      </main>
    );
  }

  const contentBlocks = getPostContentBlocks(post);

  return (
    <main className="min-h-screen bg-[#05080d] px-5 py-8 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to bulletins
        </Link>

        <article>
          <header className="mb-8 border-b border-white/10 pb-7">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#42E8FF]">Pulse of Profit Bulletin</p>
            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0D1624] text-slate-300" aria-hidden="true">
                <UserRound className="h-4 w-4" />
              </span>
              <span className="font-semibold text-slate-200">{post.author}</span>
              <span aria-hidden="true">·</span>
              <time>{post.date}</time>
            </div>
          </header>

          <div className="space-y-8">
            {contentBlocks.map((block, index) => {
              if (block.type === 'text') {
                return <p key={`text-${index}`} className="whitespace-pre-line text-base leading-8 text-slate-200 sm:text-lg sm:leading-9">{block.text}</p>;
              }

              const mediaUrls = getPostBlockMediaUrls(block);
              return (
                <div key={`media-${index}`} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {mediaUrls.map((media, mediaIndex) => {
                    const src = media.startsWith('/') ? `${API_BASE_URL}${media}` : media;
                    const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(media);
                    return isVideo ? (
                      <video key={`${media}-${mediaIndex}`} src={src} controls className="h-auto w-full rounded-2xl border border-white/10 object-contain" />
                    ) : (
                      <img key={`${media}-${mediaIndex}`} src={src} alt={`${post.title} media ${mediaIndex + 1}`} className="h-auto w-full rounded-2xl border border-white/10 object-contain" />
                    );
                  })}
                </div>
              );
            })}
          </div>

          <section id="comments-section" className="mt-12 scroll-mt-24 border-t border-white/10 pt-8">
            <h2 className="mb-5 text-xl font-bold text-white">
              Comments <span className="text-sm font-medium text-slate-400">({post.comments?.length || 0})</span>
            </h2>

            {token && (
              <form onSubmit={handleSubmitComment} className="mb-7 flex flex-col gap-3 sm:flex-row">
                <input
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Write a comment..."
                  aria-label="Write a comment"
                  maxLength={2000}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0D1624] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#42E8FF]/50"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="rounded-xl bg-[#42E8FF] px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingComment ? 'Posting…' : 'Post comment'}
                </button>
                {commentError && <p role="alert" className="text-sm text-rose-400 sm:basis-full">{commentError}</p>}
              </form>
            )}

            {post.comments?.length ? (
              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <article key={comment.id} className="flex gap-3 rounded-2xl border border-white/10 bg-[#0D1624]/70 p-4">
                    <img
                      src={comment.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(comment.author)}`}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full border border-white/10 bg-[#080d16] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-x-2 text-sm">
                        <span className="font-semibold text-white">{comment.author}</span>
                        <time className="text-xs text-slate-500">{comment.timestamp}</time>
                      </div>
                      <p className="whitespace-pre-line break-words text-sm leading-6 text-slate-300">{comment.content}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-white/10 bg-[#0D1624]/50 px-4 py-8 text-center text-sm text-slate-400">No comments yet.</p>
            )}
          </section>
        </article>
      </div>
    </main>
  );
}
