import React from 'react';

export function Waveform({ active = true, barCount = 5, color = '#2DD4BF', size = 'md' }) {
  const heights = [
    'h-2', 'h-4', 'h-6', 'h-3', 'h-5', 'h-7', 'h-4', 'h-2'
  ];

  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-300 ${
            active ? `animate-wave-${(i % 5) + 1}` : 'h-1.5'
          }`}
          style={{
            backgroundColor: color,
            height: active ? undefined : '4px',
          }}
        />
      ))}
    </div>
  );
}
