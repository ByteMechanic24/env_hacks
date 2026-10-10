import React from 'react';
import { Droplets, Flame, Wind, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export function ScenariosSection({ onScrollToSimulation }) {
  const scenarios = [
    {
      id: "flood",
      title: "River Flooding & Inundation",
      geography: "Bihar (Kosi & Gandak Plains)",
      status: "Live in Demo",
      statusColor: "#3DDC84",
      icon: Droplets,
      iconColor: "#2DD4BF",
      description:
        "Outbound Hindi calls placed upon river alert. Bedrock triages roof stranding, cut-off access roads, and vulnerable children to inform officials.",
      actionLabel: "Test in Live Simulation",
      isLive: true,
    },
    {
      id: "heatwave",
      title: "Severe Heatwave & Wet-Bulb Warning",
      geography: "Rajasthan & Central India",
      status: "Roadmap",
      statusColor: "#FFB020",
      icon: Flame,
      iconColor: "#FFB020",
      description:
        "Roadmap: warn residents and collect their status during severe heatwaves.",
      actionLabel: "Architecture Planned",
      isLive: false,
    },
    {
      id: "aqi",
      title: "Severe Winter AQI & Inversion Emergency",
      geography: "Delhi-NCR & Indo-Gangetic Plain",
      status: "Roadmap",
      statusColor: "#FFB020",
      icon: Wind,
      iconColor: "#38BDF8",
      description:
        "Roadmap: warn residents and collect their status during poor air quality crises.",
      actionLabel: "Architecture Planned",
      isLive: false,
    },
  ];

  return (
    <section className="py-20 md:py-28 border-t border-[#1F2E47] bg-[#0A0E1A] relative">
      <div className="site-container">
        {/* Eyebrow & Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#1F2E47] text-xs font-mono text-[#8E9DB7] mb-4">
            <span className="text-[#FFB020]">06 //</span>
            <span>MULTI-HAZARD RESILIENCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-ui text-[#F5F7FB] tracking-tight leading-tight mb-4">
            Environmental Disaster Scenarios
          </h2>
          <p className="text-base sm:text-lg text-[#8E9DB7] font-ui">
            Track 2 focuses on Heat & Water. Project Awaaz is built live for river flooding and architected to extend to heatwave and air quality crises.
          </p>
        </div>

        {/* 3 Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarios.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`glass-panel p-6 sm:p-7 flex flex-col justify-between transition-all ${
                  item.isLive
                    ? 'border-[#2DD4BF]/50 glow-teal-sm'
                    : 'border-[#1F2E47] opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#1F2E47]">
                    <div
                      className="p-3 rounded-xl bg-[#0A0E1A] border border-[#1F2E47]"
                      style={{ color: item.iconColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className="text-xs font-mono px-2.5 py-0.5 rounded font-semibold"
                      style={{
                        backgroundColor: `${item.statusColor}15`,
                        color: item.statusColor,
                        border: `1px solid ${item.statusColor}30`,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-[#8E9DB7] mb-1">
                    {item.geography}
                  </div>
                  <h3 className="text-lg font-bold text-[#F5F7FB] font-ui mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[#8E9DB7] leading-relaxed mb-6 font-ui">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1F2E47]">
                  {item.isLive ? (
                    <button
                      onClick={onScrollToSimulation}
                      className="w-full py-2.5 rounded-xl bg-[#2DD4BF] hover:bg-[#20b8a5] text-[#0A0E1A] font-bold text-xs font-ui transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="w-full py-2.5 rounded-xl bg-[#0A0E1A] border border-[#1F2E47] text-[#8E9DB7] font-mono text-xs text-center flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#FFB020]" />
                      <span>{item.actionLabel}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
