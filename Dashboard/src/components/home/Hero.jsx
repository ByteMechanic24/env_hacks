import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowUpRight, Phone, MapPin } from 'lucide-react';

export function Hero({ onScrollToSimulation }) {
  const techChips = [
    'AWS Lambda',
    'SQS',
    'DynamoDB',
    'Bedrock',
    'SNS',
    'ElevenLabs',
    'Exotel',
  ];

  return (
    <section className="relative min-h-[80vh] flex flex-col justify-center py-16 md:py-24 bg-gradient-to-b from-[#F5F9FC] to-white border-b border-[#D5E2EC]">
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Badge placed above H1 with mb-6 */}
            {/* <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2F8] border border-[#D5E2EC] text-xs font-medium text-[#4A6178]">
                <span className="w-2 h-2 rounded-full bg-[#0F6FA8]" />
                <span>WeMakeDevs × AWS Environmental Hacks 2026</span>
              </span>
            </div> */}

            {/* H1 */}
            <h1 className="font-heading font-extrabold text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] leading-[1.08] tracking-[-0.02em] text-[#0B2540] max-w-[18ch]">
              When the water rises, the phone should{' '}
              <span className="font-serif italic font-normal text-[#0F6FA8]">
                talk back.
              </span>
            </h1>

            {/* Sub */}
            <p className="text-lg md:text-[1.0625rem] text-[#4A6178] leading-[1.65] max-w-[54ch]">
              Sentinel calls flood-risk families in Hindi, listens to their status, and tells officials who is most at risk.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onScrollToSimulation}
                className="btn-primary"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch the simulation</span>
              </button>

              <Link
                to="/technical"
                className="btn-secondary group"
              >
                <span>Technical Approach</span>
                <ArrowUpRight className="w-4 h-4 text-[#0F6FA8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* Quiet Tech Chips Row */}
            <div className="pt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-xs text-[#7A8FA3] font-medium mr-1">Built with:</span>
              {techChips.map((chip) => (
                <span
                  key={chip}
                  className="px-2.5 py-1 rounded-md bg-[#EAF2F8] border border-[#D5E2EC] text-[#4A6178] font-medium"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: ONE clean visual card */}
          <div className="lg:col-span-5">
            <div className="card-soft p-6 md:p-7 bg-white relative">
              {/* Call Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#D5E2EC]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DCEEFA] text-[#0F6FA8] flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0B2540]">
                      Outbound Call • Kosi Basin
                    </div>
                    <div className="text-xs text-[#12A594] font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#12A594] animate-ping" />
                      <span>Live Dialogue</span>
                    </div>
                  </div>
                </div>

                {/* Waveform */}
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EAF2F8]" aria-hidden="true">
                  <span className="w-1 bg-[#12A594] rounded-full wave-bar-1" />
                  <span className="w-1 bg-[#12A594] rounded-full wave-bar-2" />
                  <span className="w-1 bg-[#12A594] rounded-full wave-bar-3" />
                  <span className="w-1 bg-[#12A594] rounded-full wave-bar-4" />
                </div>
              </div>

              {/* One Hindi line with English subtitle */}
              <div className="p-4 rounded-xl bg-[#F5F9FC] border border-[#D5E2EC] mb-5 space-y-2">
                <div className="text-xs font-semibold text-[#0F6FA8]">
                  ElevenLabs Voice Agent (Hindi)
                </div>
                <p className="font-hindi text-base text-[#0B2540] leading-snug">
                  "नमस्कार रमेश जी। कोसी नदी खतरे के निशान से ऊपर है। क्या आप सुरक्षित हैं?"
                </p>
                <p className="text-xs text-[#4A6178] italic">
                  "Namaskar Ramesh ji. The Kosi river is above the danger mark. Are you safe?"
                </p>
              </div>

              {/* Small Light River Map with one pulsing red P1 pin */}
              <div className="relative h-36 rounded-xl bg-[#EAF2F8] border border-[#D5E2EC] overflow-hidden p-3 flex flex-col justify-between">
                {/* Stylized River SVG */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 120">
                  <path
                    d="M -10,70 Q 70,30 140,75 T 310,50"
                    fill="none"
                    stroke="#0F6FA8"
                    strokeWidth="18"
                    strokeOpacity="0.15"
                  />
                  <path
                    d="M -10,70 Q 70,30 140,75 T 310,50"
                    fill="none"
                    stroke="#0F6FA8"
                    strokeWidth="3"
                    strokeDasharray="4 4"
                    strokeOpacity="0.4"
                  />
                </svg>

                {/* Map labels */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#0B2540] bg-white/90 px-2 py-0.5 rounded border border-[#D5E2EC]">
                    Kosi River • Khagaria
                  </span>
                  <span className="text-[11px] text-[#4A6178] bg-white/90 px-2 py-0.5 rounded border border-[#D5E2EC]">
                    10 Seeded Households
                  </span>
                </div>

                {/* One Pulsing Red P1 Pin */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FEE4E2] border border-[#FECDCA] text-[#D92D20]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D92D20] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D92D20]" />
                    </span>
                    <span className="text-xs font-bold">
                      P1 Critical: Sonbarsa (5 on roof)
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0F6FA8] bg-[#DCEEFA] px-2 py-0.5 rounded border border-[#B9E0F7]">
                    Officials notified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
