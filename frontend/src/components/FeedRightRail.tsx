'use client';

import { Search } from 'lucide-react';

export default function FeedRightRail({ onSearchClick }: { onSearchClick: () => void }) {
  const sampleSubscriptions = [
    { name: 'Market Pulse', initials: 'MP', colors: 'from-cyan-400 to-blue-700' },
    { name: 'Alpha Insights', initials: 'AI', colors: 'from-amber-300 to-orange-600' },
    { name: 'Equity Daily', initials: 'ED', colors: 'from-emerald-400 to-teal-700' },
  ];

  return (
    <>
      <section className="overflow-hidden py-3 xl:hidden" aria-label="Subscriptions">
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

      <aside className="sticky top-0 col-start-3 row-start-1 hidden h-screen flex-col gap-5 py-7 xl:flex">
        <button onClick={onSearchClick} className="flex h-[52px] w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 text-left text-sm text-slate-500 transition hover:border-white/20 hover:text-slate-300">
          <Search className="h-5 w-5" />
          <span>Search bulletins</span>
        </button>
        <div className="min-h-[184px] rounded-2xl border border-white/10 bg-white/[0.035] p-4" aria-label="Subscriptions">
          <h2 className="mb-4 text-sm font-semibold text-white">Subscriptions</h2>
          <div className="flex items-start gap-5">
            {sampleSubscriptions.map((subscription) => (
              <div key={subscription.name} className="flex w-[76px] shrink-0 flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-emerald-400 p-[3px] shadow-[0_0_0_2px_rgba(52,211,153,0.16)]" aria-hidden="true">
                  <div className={`flex h-[62px] w-[62px] items-center justify-center rounded-full bg-gradient-to-br ${subscription.colors} text-sm font-extrabold text-white`}>
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
