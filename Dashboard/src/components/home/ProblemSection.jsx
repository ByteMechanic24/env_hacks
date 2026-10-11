import React from 'react';
import { MessageSquareOff, BookOpen, EyeOff, ArrowRight } from 'lucide-react';

export function ProblemSection({ onScrollToSolution }) {
  const cards = [
    {
      icon: MessageSquareOff,
      title: "One-Way SMS",
      sentence: "No confirmation anyone received or understood the broadcast.",
    },
    {
      icon: BookOpen,
      title: "Many Can't Read It",
      sentence: "About 1 in 4 rural flood-belt residents is functionally illiterate.",
    },
    {
      icon: EyeOff,
      title: "Officials See No Status",
      sentence: "No house-level information on who is in trouble.",
    },
  ];

  return (
    <section id="problem" className="py-20 md:py-28 bg-[#F5F9FC] border-b border-[#D5E2EC]">
      <div className="site-container">
        {/* Section Header */}
        <div className="max-w-[60ch] mb-12">
          <h2 className="font-heading font-bold text-[1.75rem] sm:text-[2.25rem] lg:text-[2.5rem] text-[#0B2540] tracking-[-0.02em] leading-tight mb-4">
            Text alerts fail the people who need them most.
          </h2>
          <p className="text-base text-[#4A6178] leading-relaxed">
            Unidirectional broadcasts cannot confirm receipt or assess household status during sudden river breaches.
          </p>
        </div>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="card-soft p-6 md:p-8 bg-white flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#0B2540] mb-2">
                    {c.title}
                  </h3>
                  <p className="text-[15px] text-[#4A6178] leading-relaxed">
                    {c.sentence}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Text link CTA */}
        <div>
          <button
            onClick={onScrollToSolution}
            className="inline-flex items-center gap-2 text-base font-semibold text-[#0F6FA8] hover:text-[#0B5A8A] transition-colors cursor-pointer group"
          >
            <span>See how Sentinel fixes this</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
