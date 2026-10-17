'use client';

import { Search, X } from 'lucide-react';

interface FeedRightRailProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onSearchClick?: () => void;
}

export default function FeedRightRail({
  searchQuery = '',
  setSearchQuery,
  onSearchClick
}: FeedRightRailProps) {
  const sampleSubscriptions = [
    { name: 'Market Pulse', initials: 'MP', colors: 'from-cyan-400 to-blue-700' },
    { name: 'Alpha Insights', initials: 'AI', colors: 'from-amber-300 to-orange-600' },
    { name: 'Equity Daily', initials: 'ED', colors: 'from-emerald-400 to-teal-700' },
  ];

  return (
    <>
      <section className="overflow-hidden py-3 lg:hidden" aria-label="Subscriptions">
        <div className="flex gap-5 overflow-x-auto px-1 pb-2">
          {sampleSubscriptions.map((subscription) => (
            <div key={subscription.name} className="flex w-[82px] shrink-0 flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-emerald-400 p-[3px] shadow-[0_0_0_2px_rgba(52,211,153,0.16)]" aria-hidden="true">
                <div className={`flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gradient-to-br ${subscription.colors} text-sm font-extrabold text-white`}>
                  {subscription.initials}
                </div>
              </div>
              <span className="w-full truncate text-xs text-slate-300">{subscription.name}</span>
            </div>
          ))}
        </div>
      </section>

      <aside className="sticky top-0 col-start-3 row-start-1 hidden h-screen flex-col gap-5 py-7 lg:flex">
        <div className="relative flex h-[52px] w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 transition-all focus-within:border-[#42E8FF]/50 focus-within:bg-[#0D1624] focus-within:shadow-[0_0_20px_rgba(66,232,255,0.12)]">
          <Search className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-focus-within:text-[#42E8FF]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery?.(e.target.value)}
            placeholder="Search bulletins..."
            aria-label="Search bulletins"
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery?.('')}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="min-h-[184px] rounded-2xl border border-white/10 bg-white/[0.035] p-4" aria-label="Subscriptions">
          <h2 className="mb-4 text-sm font-semibold text-white">Subscriptions</h2>
          <div className="flex items-start gap-2 xl:gap-5">
            {sampleSubscriptions.map((subscription) => (
              <div key={subscription.name} className="flex w-[68px] shrink-0 flex-col items-center gap-2 text-center xl:w-[76px]">
                <div className="rounded-full bg-emerald-400 p-[3px] shadow-[0_0_0_2px_rgba(52,211,153,0.16)]" aria-hidden="true">
                  <div className={`flex h-[54px] w-[54px] items-center justify-center rounded-full bg-gradient-to-br ${subscription.colors} text-sm font-extrabold text-white xl:h-[62px] xl:w-[62px]`}>
                    {subscription.initials}
                  </div>
                </div>
                <span className="w-full truncate text-[11px] text-slate-300">{subscription.name}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
