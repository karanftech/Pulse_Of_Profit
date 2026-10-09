'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, authenticateWithEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await authenticateWithEmail(cleanEmail);
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 700);
    } catch (err: any) {
      const msg = String(err.message || '').toLowerCase();
      if (!msg.includes('already exists') && !msg.includes('exists')) {
        setError(err.message || 'Authentication error. Please try again.');
      } else {
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#050505] overflow-hidden text-white font-sans">
      
      {/* Background Video */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center filter brightness-100 contrast-105"
        >
          <source src="/logo-bg.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
      </div>

      {/* Back to Home Link */}
      <Link 
        href="/"
        className="fixed top-6 left-6 z-30 inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-black/30 border border-white/20 hover:border-[#42E8FF]/50 text-slate-200 hover:text-white backdrop-blur-md text-xs font-medium transition-all group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Portal</span>
      </Link>

      {/* Ultra-Transparent Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-20 w-full max-w-md my-auto rounded-3xl border border-white/20 bg-black/10 backdrop-blur-[2px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden p-6 sm:p-8"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4DFFB8] to-transparent opacity-80" />

        {/* Header */}
        <div className="text-center mb-6 pt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            Welcome to Pulse of Profit
          </h1>
          <p className="text-xs sm:text-sm text-slate-100 mt-2 leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-medium">
            Enter your email to sign in or create an account. You'll be logged in automatically.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 bg-rose-600/30 border border-rose-500/50 rounded-xl flex items-center gap-2.5 text-rose-100 text-xs sm:text-sm backdrop-blur-sm shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-600/30 border border-emerald-500/50 rounded-xl flex items-center gap-2.5 text-emerald-100 text-xs sm:text-sm backdrop-blur-sm shadow-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email-Only Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-100 mb-1.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-200 group-focus-within:text-[#4DFFB8] transition-colors drop-shadow" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-black/25 border border-white/25 focus:border-[#4DFFB8] focus:bg-black/45 focus:shadow-[0_0_20px_rgba(77,255,184,0.4)] rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-slate-300 focus:outline-none transition-all drop-shadow"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full mt-3 py-3.5 px-4 relative overflow-hidden rounded-xl font-extrabold text-slate-950 flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-[0_0_30px_rgba(77,255,184,0.4)] group bg-gradient-to-r from-[#2D9CFF] via-[#42E8FF] to-[#4DFFB8] hover:shadow-[0_0_40px_rgba(77,255,184,0.7)]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Continue with Email</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
