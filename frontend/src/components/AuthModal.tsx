'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { 
    user, 
    isAuthModalOpen, 
    closeAuthModal, 
    authenticateWithEmail 
  } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Play video smoothly when modal opens
  useEffect(() => {
    if (isAuthModalOpen && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

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
      setSuccessMsg('Authenticated successfully!');
    } catch (err: any) {
      const msg = String(err.message || '').toLowerCase();
      if (!msg.includes('already exists') && !msg.includes('exists')) {
        setError(err.message || 'An error occurred. Please try again.');
      } else {
        setSuccessMsg('Welcome back!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto min-h-screen">
        
        {/* ================= BACKGROUND VIDEO OF LOGO ================= */}
        <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full scale-[1.12] object-cover object-center filter brightness-100 contrast-105"
          >
            <source src="/logo-bg.mp4" type="video/mp4" />
          </video>

          {/* Very light edge gradient so the video is fully visible and vibrant */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
        </div>

        {/* Modal Backdrop Click */}
        <div 
          className="fixed inset-0 z-10 cursor-pointer"
          onClick={() => {
            if (user) closeAuthModal();
          }}
        />

        {/* ================= ULTRA-TRANSPARENT AUTH FORM CARD ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20 w-full max-w-md my-auto rounded-3xl border border-white/10 bg-black/[0.015] backdrop-blur-[1px] shadow-[0_8px_32px_rgba(0,0,0,0.26)] overflow-hidden text-white p-6 sm:p-8"
        >
          {/* Subtle cyan glow line across top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#42E8FF] to-transparent opacity-80" />

          {/* Dismiss / Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-slate-200 hover:text-white bg-black/30 hover:bg-black/50 border border-white/20 p-2 rounded-xl transition-all z-30"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 pt-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              Welcome to Pulse of Profit
            </h2>
            <p className="text-xs sm:text-sm text-slate-100 mt-2 leading-relaxed max-w-xs mx-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-medium">
              Enter your email to sign in or create an account. You'll be logged in automatically.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-rose-600/30 border border-rose-500/50 rounded-xl flex items-center gap-2.5 text-rose-100 text-xs sm:text-sm backdrop-blur-sm shadow-lg"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-emerald-600/30 border border-emerald-500/50 rounded-xl flex items-center gap-2.5 text-emerald-100 text-xs sm:text-sm backdrop-blur-sm shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Email-Only Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-100 mb-1.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-200 group-focus-within:text-[#42E8FF] transition-colors drop-shadow" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/5 border border-white/25 focus:border-[#42E8FF] focus:bg-black/15 focus:shadow-[0_0_20px_rgba(66,232,255,0.4)] rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-slate-300 focus:outline-none transition-all drop-shadow"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full mt-3 py-3.5 px-4 relative overflow-hidden rounded-xl font-extrabold text-slate-950 flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-[0_0_30px_rgba(66,232,255,0.4)] group bg-gradient-to-r from-[#2D9CFF]/90 via-[#42E8FF]/90 to-[#4DFFB8]/90 hover:shadow-[0_0_40px_rgba(66,232,255,0.7)]"
            >
              {/* Button shimmer hover effect */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/25 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out pointer-events-none" />

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
    </AnimatePresence>
  );
}
