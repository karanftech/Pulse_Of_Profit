'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link2, Send, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  anchorElement: HTMLElement | null;
  showToast: (msg: string) => void;
}

interface MenuPosition {
  left: number;
  top: number;
}

export default function ShareModal({ isOpen, onClose, url, title, anchorElement, showToast }: ShareModalProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  useEffect(() => {
    if (!isOpen || !anchorElement) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const menu = menuRef.current;
      if (!menu) return;

      const anchor = anchorElement.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const margin = 12;
      const left = Math.min(
        Math.max(margin, anchor.right - menuRect.width),
        window.innerWidth - menuRect.width - margin,
      );

      let top = anchor.bottom + 8;
      if (top + menuRect.height > window.innerHeight - margin) {
        const above = anchor.top - menuRect.height - 8;
        top = above >= margin ? above : Math.max(margin, window.innerHeight - menuRect.height - margin);
      }

      setPosition({ left, top });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, anchorElement]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !anchorElement?.contains(target)) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isOpen, onClose, anchorElement]);

  if (!isOpen || !anchorElement || typeof document === 'undefined') return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title} ${url}`);
  const menuItemClass = 'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-[#42E8FF]/10 hover:text-white focus:bg-[#42E8FF]/10 focus:outline-none';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied.');
    } catch {
      showToast('Could not copy the link.');
    }
    onClose();
  };

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Share post"
      style={{
        position: 'fixed',
        left: position?.left ?? 0,
        top: position?.top ?? 0,
        visibility: position ? 'visible' : 'hidden',
        maxHeight: 'calc(100vh - 24px)',
      }}
      className="z-[100] w-[250px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-2xl border border-[#42E8FF]/20 bg-[#0D1624]/95 py-2 text-white shadow-[0_16px_48px_rgba(0,0,0,0.65)] backdrop-blur-xl"
    >
      <a role="menuitem" href={`https://api.whatsapp.com/send?text=${encodedText}`} target="_blank" rel="noopener noreferrer" onClick={onClose} className={menuItemClass}>
        <MessageCircle className="h-5 w-5 shrink-0 text-[#25D366]" />
        <span>WhatsApp</span>
      </a>
      <a role="menuitem" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" onClick={onClose} className={menuItemClass}>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-sm font-bold text-white">f</span>
        <span>Facebook</span>
      </a>
      <a role="menuitem" href={`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" onClick={onClose} className={menuItemClass}>
        <Send className="h-5 w-5 shrink-0 text-[#2AABEE]" />
        <span>Telegram</span>
      </a>
      <a role="menuitem" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" onClick={onClose} className={menuItemClass}>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-[#0A66C2] text-[10px] font-bold text-white">in</span>
        <span>LinkedIn</span>
      </a>
      <a role="menuitem" href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" onClick={onClose} className={menuItemClass}>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-base font-semibold text-[#42E8FF]">𝕏</span>
        <span>Twitter</span>
      </a>
      <div className="my-1 border-t border-white/10" />
      <button type="button" role="menuitem" onClick={copyLink} className={menuItemClass}>
        <Link2 className="h-5 w-5 shrink-0 text-slate-300" />
        <span>Copy link</span>
      </button>
    </div>,
    document.body,
  );
}
