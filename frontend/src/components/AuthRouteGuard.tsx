'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const publicPaths = new Set(['/', '/login', '/register', '/vyavasthapak']);

export default function AuthRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const requiresLogin = !publicPaths.has(pathname);

  useEffect(() => {
    if (!isLoadingAuth && requiresLogin && !user) router.replace('/');
  }, [isLoadingAuth, requiresLogin, router, user]);

  if (requiresLogin && (isLoadingAuth || !user)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05080d] text-white">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-slate-300">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#42E8FF] border-t-transparent" />
          {isLoadingAuth ? 'Checking your session…' : 'Sign in to continue…'}
        </div>
      </main>
    );
  }

  return children;
}
