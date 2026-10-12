'use client';

import React from 'react';
import { Send, Instagram, Twitter } from 'lucide-react';

export default function FooterWidget() {
  return (
    <footer className="bg-[#050505] border-t border-white/10 pt-16 pb-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Brand Column */}
        <div id="about" className="md:col-span-5 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl btn-cyan-gradient flex items-center justify-center font-bold text-black font-display text-lg">
              P
            </div>
            <div>
              <span className="font-bold text-lg text-white font-display">PULSE OF PROFIT</span>
              <div className="text-[10px] text-[#A0A7B5] tracking-widest uppercase">Financial Intelligence</div>
            </div>
          </div>
          
          <p className="text-xs text-[#A0A7B5] max-w-sm leading-relaxed">
            Empowering traders, retail investors, and institutional desks with daily market bulletins, AI signal telemetry, and real-time market insights.
          </p>
        </div>

        {/* Social Navigation Links */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-sm font-bold text-white font-display">Connect With Us</h4>
          <ul className="space-y-3 text-xs text-[#A0A7B5]">
            <li>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center space-x-2 hover:text-[#42E8FF] transition-colors">
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>Instagram</span>
              </a>
            </li>
            <li>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex items-center space-x-2 hover:text-[#42E8FF] transition-colors">
                <Twitter className="w-4 h-4 text-sky-400" />
                <span>Twitter / X</span>
              </a>
            </li>
            <li>
              <a href="https://t.me/PulseOfProfitnews" target="_blank" rel="noreferrer" className="flex items-center space-x-2 hover:text-[#42E8FF] transition-colors">
                <Send className="w-4 h-4 text-cyan-400" />
                <span>Telegram Community</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="text-sm font-bold text-white font-display">Market Bulletin Digest</h4>
          <p className="text-xs text-[#A0A7B5]">Receive daily morning market telemetry directly to your inbox.</p>

          <form onSubmit={(e) => e.preventDefault()} className="flex items-center space-x-2 pt-1">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full px-4 py-3 rounded-[20px] glass-input text-xs text-white placeholder-[#A0A7B5]"
            />
            <button className="px-5 py-3 rounded-[20px] btn-cyan-gradient text-xs font-bold shrink-0">
              Join
            </button>
          </form>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-[#A0A7B5] gap-4">
        <div>© 2026 Pulse of Profit. All rights reserved.</div>
        <div className="flex space-x-6">
          <a id="privacy" href="#privacy" className="hover:text-white">Privacy Policy</a>
          <a id="terms" href="#terms" className="hover:text-white">Terms of Service</a>
          <a href="#" className="hover:text-white">Risk Disclaimer</a>
        </div>
      </div>
    </footer>
  );
}
