import React from 'react';
import { SlidersHorizontal, PhoneCall, BrainCircuit, Map } from 'lucide-react';

export function WhatWeBuilt() {
  const cards = [
    {
      icon: SlidersHorizontal,
      title: "Officer Console",
      sentence: "Select districts and pincodes to initiate parallel outbound phone alerts in seconds.",
      service: "API Gateway + Lambda + SQS",
    },
    {
      icon: PhoneCall,
      title: "Hindi Voice Agent",
      sentence: "Speaks respectful, natural Hindi with barge-in interruption on basic 2G feature phones.",
      service: "ElevenLabs + Exotel",
    },
    {
      icon: BrainCircuit,
      title: "Bedrock Triage",
      sentence: "Turns spoken answers into a priority and structured status.",
      service: "Claude 3.5 Sonnet + Guardrails",
    },
    {
      icon: Map,
      title: "Live Status Map",
      sentence: "Pins show every household's priority for officials.",
      service: "DynamoDB GSI + Amazon SNS",
    },
  ];

  return (
    <section id="solution" className="py-20 md:py-28 bg-white border-b border-[#D5E2EC]">
      <div className="site-container">
        {/* Header */}
        <div className="max-w-[60ch] mb-12">
          <h2 className="font-heading font-bold text-[1.75rem] sm:text-[2.25rem] lg:text-[2.5rem] text-[#0B2540] tracking-[-0.02em] leading-tight mb-4">
            Four parts, one closed loop.
          </h2>
          <p className="text-base text-[#4A6178] leading-relaxed">
            ElevenLabs handles the voice acoustic interface. AWS handles all orchestration, validation, Bedrock triage, and alerting.
          </p>
        </div>

        {/* 2x2 Grid of 4 Equal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="card-soft p-6 md:p-8 bg-[#F5F9FC] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#DCEEFA] text-[#0F6FA8] flex items-center justify-center">
                      <Icon className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <span className="text-xs font-mono text-[#7A8FA3] bg-white px-2.5 py-1 rounded-md border border-[#D5E2EC]">
                      {c.service}
                    </span>
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
      </div>
    </section>
  );
}
