'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Send, Sparkles } from 'lucide-react';

interface PinnedPostProps {
  id: string;
  title: string;
  date: string;
  content: string;
  telegramUrl: string;
}

export default function PinnedPost({ id, title, date, content, telegramUrl }: PinnedPostProps) {
  return (
    <div className="relative overflow-hidden rounded-[20px] glass-panel glass-panel-hover p-5 sm:p-6 md:p-8 border border-white/10 group shadow-2xl">
      
      {/* Background glow orb */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#42E8FF]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#42E8FF]/20 transition-all duration-300" />
      
      <div className="relative z-10 flex flex-col justify-between gap-5 sm:gap-6 2xl:flex-row 2xl:items-center">
        <div className="flex-1 space-y-3 sm:space-y-4">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#42E8FF]/15 text-[#42E8FF] border border-[#42E8FF]/30 shadow-[0_0_12px_rgba(66,232,255,0.2)]">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-[#42E8FF] animate-pulse" />
              Featured Bulletin
            </span>
            <span className="text-xs text-[#A0A7B5] font-mono">{date}</span>
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-lg sm:text-xl md:text-2xl lg:text-3xl text-white tracking-tight group-hover:text-[#42E8FF] transition-colors">
              {title}
            </h2>
          </div>

          <div className="text-xs sm:text-sm text-[#A0A7B5] leading-relaxed max-w-2xl flex items-center space-x-2 bg-[#0D1624]/60 p-3 rounded-xl border border-white/5">
            <Send className="w-4 h-4 text-[#42E8FF] shrink-0" />
            <span className="truncate">Telegram Broadcast: <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="text-[#42E8FF] hover:underline font-semibold">{telegramUrl}</a></span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          <Link 
            href={`/posts/${id}`}
            className="inline-flex items-center space-x-3 px-7 py-3.5 btn-cyan-gradient font-display font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 shadow-[0_0_25px_rgba(66,232,255,0.4)]"
          >
            <span>Read Bulletin</span>
            <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
