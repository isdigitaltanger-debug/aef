import React from "react";

export default function Marquee({ items }) {
  const row = (hidden) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 text-sm font-bold uppercase tracking-[0.18em] text-brand-ink/60 whitespace-nowrap">
            {it}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden border-y border-brand-line bg-white py-4" data-testid="editorial-marquee">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
