import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Trigger",
      text: "Officer starts the alert; Orchestrator queries DynamoDB and enqueues valid households to SQS.",
    },
    {
      num: "02",
      title: "Call",
      text: "Call Worker places Exotel outbound call; WebSocket bridge connects audio to ElevenLabs Hindi voice agent.",
    },
    {
      num: "03",
      title: "Triage",
      text: "Bedrock classifies priority mid-call and returns verified spoken safety guidance.",
    },
    {
      num: "04",
      title: "Notify",
      text: "Officials are alerted via SNS; status map updates with color-coded household priority pins.",
    },
  ];

  return (
    <section id="how" className="py-20 md:py-28 bg-white border-b border-[#D5E2EC]">
      <div className="site-container">
        {/* Header */}
        <div className="max-w-[60ch] mb-12">
          <h2 className="font-heading font-bold text-[1.75rem] sm:text-[2.25rem] lg:text-[2.5rem] text-[#0B2540] tracking-[-0.02em] leading-tight mb-4">
            From one click to an informed response.
          </h2>
          <p className="text-base text-[#4A6178] leading-relaxed">
            Automated serverless execution warning citizens, collecting household status, and notifying officials.
          </p>
        </div>

        {/* Horizontal 4-step timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {steps.map((s, idx) => (
            <div key={idx} className="card-soft p-6 bg-[#F5F9FC] flex flex-col justify-between">
              <div>
                <span className="font-mono text-sm font-bold text-[#0F6FA8] mb-3 block">
                  {s.num}
                </span>
                <h3 className="font-heading font-bold text-base text-[#0B2540] mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-[#4A6178] leading-relaxed">
                  {s.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Single band with CTA button */}
        <div className="p-6 rounded-[20px] bg-[#EAF2F8] border border-[#D5E2EC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-medium text-[#0B2540]">
            Detailed architecture specifications, IAM policies, and schemas are on a separate page.
          </span>
          <Link to="/technical" className="btn-primary shrink-0 group">
            <span>Technical Approach</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
