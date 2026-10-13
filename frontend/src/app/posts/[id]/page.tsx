'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { API_BASE_URL, useAuth } from '@/context/AuthContext';
import { getPostContentBlocks, Post } from '@/types/post';

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
  const { token } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

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
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
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

              const src = block.url.startsWith('/') ? `${API_BASE_URL}${block.url}` : block.url;
              const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(block.url);
              return isVideo ? (
                <video key={`media-${index}`} src={src} controls className="h-auto w-full rounded-2xl border border-white/10 object-contain" />
              ) : (
                <img key={`media-${index}`} src={src} alt={`${post.title} media ${index + 1}`} className="h-auto w-full rounded-2xl border border-white/10 object-contain" />
              );
            })}
          </div>
        </article>
      </div>
    </main>
  );
}
