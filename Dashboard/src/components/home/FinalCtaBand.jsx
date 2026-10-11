import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowUpRight, Cpu } from 'lucide-react';

export function FinalCtaBand({ onScrollToSimulation }) {
  return (
    <section className="py-20 md:py-28 border-t border-[#1F2E47] bg-[#0A0E1A] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#2DD4BF]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="site-container relative z-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#1F2E47] text-xs font-mono text-[#8E9DB7] mb-6">
          <span className="text-[#2DD4BF]">PROJECT SENTINEL //</span>
          <span>MISSION CONTROL TO ARCHITECTURE</span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold font-ui text-[#F5F7FB] tracking-tight leading-tight mb-6">
          See the system.{' '}
          <span className="text-[#2DD4BF] font-serif italic block sm:inline">
            Then see how it's built.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-[#8E9DB7] font-ui mb-10 max-w-xl mx-auto">
          Explore the real-time simulation or inspect our full serverless AWS architecture specification on a dedicated deep-dive page.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onScrollToSimulation}
            className="flex items-center gap-2 px-7 py-4 rounded-full bg-[#2DD4BF] hover:bg-[#20b8a5] text-[#0A0E1A] font-bold text-sm transition-all shadow-xl shadow-[#2DD4BF]/20 cursor-pointer font-ui active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Watch simulation</span>
          </button>

          <Link
            to="/technical"
            className="flex items-center gap-2 px-7 py-4 rounded-full bg-[#111827] hover:bg-[#162032] border border-[#1F2E47] hover:border-[#2DD4BF]/60 text-[#F5F7FB] font-mono text-sm transition-all cursor-pointer group"
          >
            <Cpu className="w-4 h-4 text-[#2DD4BF]" />
            <span>Technical Approach</span>
            <ArrowUpRight className="w-4 h-4 text-[#8E9DB7] group-hover:text-[#2DD4BF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
