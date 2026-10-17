'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, BarChart3, BellRing, Newspaper, Radio, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onExplore: () => void;
  onSignIn: () => void;
}

const highlights = [
  {
    icon: Newspaper,
    title: 'Daily market bulletins',
    detail: 'Follow market updates and research in one focused feed.'
  },
  {
    icon: BarChart3,
    title: 'Clearer market context',
    detail: 'Explore stock breakdowns and ideas from the community.'
  },
  {
    icon: BellRing,
    title: 'Stay in the loop',
    detail: 'Keep up with new posts, authors, and market conversations.'
  }
];

export default function LandingPage({ onExplore, onSignIn }: LandingPageProps) {

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white selection:bg-[#42E8FF] selection:text-black">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -left-40 top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-cyan-400/15 blur-[120px]"
          animate={{ x: [0, 55, 0], y: [0, 45, 0], scale: [1, 1.14, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-40 top-[15rem] h-[34rem] w-[34rem] rounded-full bg-emerald-400/10 blur-[130px]"
          animate={{ x: [0, -50, 0], y: [0, -35, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-[18%] top-[30%] h-2 w-2 rounded-full bg-[#42E8FF] shadow-[0_0_24px_8px_rgba(66,232,255,0.3)]"
          animate={{ x: [0, 70, 24, 0], y: [0, -34, 48, 0], opacity: [0.35, 1, 0.6, 0.35], scale: [0.8, 1.25, 0.9, 0.8] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[20%] top-[68%] h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_20px_7px_rgba(110,231,183,0.25)]"
          animate={{ x: [0, -48, -12, 0], y: [0, 28, -42, 0], opacity: [0.3, 0.9, 0.5, 0.3] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <a href="#top" className="flex items-center gap-3" aria-label="Pulse of Profit home">
          <img src="/logo.png" alt="Pulse of Profit" className="h-16 w-16 shrink-0 rounded-2xl object-contain shadow-[0_0_28px_rgba(66,232,255,0.2)]" />
        </a>
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 sm:flex">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
          Your daily market pulse
        </div>
      </header>

      <section id="top" className="relative z-10 mx-auto grid min-h-[calc(100svh-88px)] max-w-7xl items-center gap-14 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:pb-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#42E8FF]/20 bg-[#42E8FF]/[0.07] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9CF5FF]">
            <Sparkles className="h-3.5 w-3.5" />
            Insight for every market day
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.99] tracking-[-0.055em] sm:text-6xl md:text-7xl">
            Find your edge in the{' '}
            <motion.span
              className="inline-block bg-gradient-to-r from-[#42E8FF] via-[#8cf6de] to-[#4DFFB8] bg-[length:200%_100%] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            >market noise.</motion.span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Pulse of Profit brings together daily market bulletins, stock analysis, and investor conversations—so you can stay informed and follow the ideas moving markets.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button onClick={onExplore} className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#42E8FF] to-[#4DFFB8] px-6 text-sm font-extrabold text-[#041015] shadow-[0_12px_38px_rgba(66,232,255,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_46px_rgba(66,232,255,0.3)] cursor-pointer">
              Explore the bulletins
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </button>
            <button onClick={onSignIn} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 text-sm font-bold text-white transition hover:border-white/30 hover:bg-white/[0.08] cursor-pointer">
              Sign in or join <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-500">A fresh perspective starts here.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 32, rotateX: 5 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.9, delay: 0.18 }} className="relative mx-auto w-full max-w-xl" style={{ perspective: 1000 }}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/[0.12] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)] backdrop-blur-[2px] sm:p-7">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#42E8FF]/80 to-transparent" />
            <div className="mb-7 flex items-center justify-between border-b border-white/[0.06] pb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#42E8FF]/10 border border-[#42E8FF]/20 p-2.5 text-[#42E8FF] shadow-[0_0_15px_rgba(66,232,255,0.15)]"><Radio className="h-5 w-5" /></div>
                <div><p className="text-sm font-bold">The daily briefing</p><p className="mt-1 text-[11px] text-slate-400">MARKET SIGNAL · COMMUNITY</p></div>
              </div>
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">In focus</span>
            </div>
            <div className="space-y-3">
              {highlights.map(({ icon: Icon, title, detail }, index) => (
                <motion.div key={title} initial={{ opacity: 0, x: 28, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} whileHover={{ x: 6, scale: 1.015 }} transition={{ delay: 0.45 + index * 0.16, type: 'spring', stiffness: 180, damping: 20 }} className="group flex gap-4 rounded-2xl border border-white/[0.06] bg-black/[0.10] backdrop-blur-[1px] p-4 transition-all hover:border-[#42E8FF]/30 hover:bg-[#42E8FF]/[0.06]">
                  <motion.div whileHover={{ rotate: 8, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }} className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#42E8FF]/15 to-emerald-300/10 text-[#8cf6de] border border-[#42E8FF]/20"><Icon className="h-[18px] w-[18px]" /></motion.div>
                  <div><h2 className="text-sm font-bold text-slate-100">{title}</h2><p className="mt-1.5 text-xs leading-5 text-slate-300">{detail}</p></div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-gradient-to-r from-[#42E8FF]/[0.06] to-emerald-300/[0.03] backdrop-blur-[1px] px-4 py-3.5">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8cf6de]">Stay curious</p><p className="mt-1 text-xs text-slate-300">Make every market day count.</p></div>
              <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}><Sparkles className="h-5 w-5 text-[#42E8FF]" /></motion.div>
            </div>
          </motion.div>
          <div className="absolute -bottom-7 -left-5 -z-10 h-32 w-32 rounded-full bg-[#42E8FF]/15 blur-3xl" />
        </motion.div>
      </section>
    </main>
  );
}
