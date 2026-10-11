import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowUpRight, Check, X } from 'lucide-react';

export function WhyItWinsSection({ onScrollToSimulation }) {
  const tableRows = [
    { dimension: 'Direction', sachet: 'One-way broadcast', sentinel: 'Two-way voice call' },
    { dimension: 'Language', sachet: 'Written text SMS', sentinel: 'Spoken Hindi dialogue' },
    { dimension: 'Reach', sachet: 'Generic mass broadcast', sentinel: 'Personalised household outreach' },
    { dimension: 'Output', sachet: 'Zero receipt feedback', sentinel: 'Structured triage JSON' },
    { dimension: 'Priority', sachet: 'None (officials blind)', sentinel: 'P1 Critical / P2 High / P3 Safe' },
  ];


  return (
    <section id="impact" className="py-20 md:py-28 bg-[#F5F9FC]">
      <div className="site-container space-y-16">
        {/* Comparison Table Header */}
        <div className="max-w-[60ch]">
          <h2 className="font-heading font-bold text-[1.75rem] sm:text-[2.25rem] lg:text-[2.5rem] text-[#0B2540] tracking-[-0.02em] leading-tight mb-4">
            SACHET today vs. Project Sentinel
          </h2>
          <p className="text-base text-[#4A6178] leading-relaxed">
            Replacing silent one-way SMS with actionable, structured voice intelligence.
          </p>
        </div>

        {/* Compact 5-row comparison table */}
        <div className="card-soft overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#D5E2EC] bg-[#F5F9FC] text-xs font-semibold text-[#4A6178]">
                  <th className="p-4 sm:p-5 w-1/3">Dimension</th>
                  <th className="p-4 sm:p-5 w-1/3 text-[#B54708]">NDMA SACHET Today</th>
                  <th className="p-4 sm:p-5 w-1/3 text-[#0F6FA8] bg-[#EAF2F8]/50">Project Sentinel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5E2EC]">
                {tableRows.map((row, i) => (
                  <tr key={i} className="hover:bg-[#F5F9FC]/50 transition-colors">
                    <td className="p-4 sm:p-5 font-semibold text-[#0B2540]">
                      {row.dimension}
                    </td>
                    <td className="p-4 sm:p-5 text-[#4A6178]">
                      {row.sachet}
                    </td>
                    <td className="p-4 sm:p-5 font-medium text-[#0B2540] bg-[#EAF2F8]/50">
                      {row.sentinel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Closing CTA Band */}
        <div className="card-soft p-8 md:p-12 bg-white text-center space-y-6">
          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2540]">
            See the system. Then see how it's built.
          </h3>
          <p className="text-base text-[#4A6178] max-w-[50ch] mx-auto">
            Test the live scripted simulation or explore our complete AWS architecture on the dedicated technical page.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onScrollToSimulation}
              className="btn-primary"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch simulation</span>
            </button>
            <Link
              to="/technical"
              className="btn-secondary group"
            >
              <span>Technical Approach</span>
              <ArrowUpRight className="w-4 h-4 text-[#0F6FA8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
