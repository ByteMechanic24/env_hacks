import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ARCHITECTURE_NODES, 
  TRIGGER_LAYER_STEPS, 
  AUDIO_BRIDGE_SPECS, 
  TRIAGE_LOGIC_RULES, 
  RESILIENCE_MATRIX 
} from '../data/architectureData';
import { 
  ArrowLeft, 
  Play, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  X, 
  ChevronRight,
  Database,
  Shield,
  Layers,
  PhoneCall,
  BrainCircuit,
  BellRing
} from 'lucide-react';

export function TechnicalPage() {
  const [activeSection, setActiveSection] = useState('arch-overview');
  const [selectedNode, setSelectedNode] = useState(ARCHITECTURE_NODES[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [componentFilter, setComponentFilter] = useState('all');

  // Accordion state (progressive disclosure - collapsed by default)
  const [expandedSections, setExpandedSections] = useState({
    awsServices: true,
    triggerFlow: false,
    callSequence: false,
    audioBridge: false,
    triageData: false,
    resilience: false,
    roadmap: false,
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const subNavItems = [
    { id: 'arch-overview', label: 'Architecture Overview' },
    { id: 'aws-services', label: 'AWS Components' },
    { id: 'trigger-flow', label: 'Trigger Execution Flow' },
    { id: 'call-sequence', label: 'Call Sequence' },
    { id: 'audio-bridge', label: 'Audio Bridge' },
    { id: 'triage-data', label: 'Triage & Data Model' },
    { id: 'safety-resilience', label: 'Safety & Resilience' },
    { id: 'roadmap', label: 'Roadmap' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (let i = subNavItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(subNavItems[i].id);
        if (el && scrollPos >= el.offsetTop) {
          setActiveSection(subNavItems[i].id);
          return;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  };

  const filteredComponents = ARCHITECTURE_NODES.filter((n) => {
    if (componentFilter === 'built') return n.status === 'built';
    if (componentFilter === 'roadmap') return n.status === 'roadmap';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F9FC] text-[#0B2540]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-16 bg-white/85 backdrop-blur-md border-b border-[#D5E2EC]">
        <div className="site-container h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#EAF2F8] hover:bg-[#DCEEFA] text-xs font-semibold text-[#0F6FA8] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to overview</span>
            </Link>
            <span className="text-sm font-heading font-bold text-[#0B2540] hidden sm:inline">
              Technical Architecture
            </span>
          </div>

          <Link
            to="/#simulation"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[12px] bg-[#0F6FA8] text-white text-xs font-semibold hover:bg-[#0B5A8A] transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Watch simulation</span>
          </Link>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="site-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sticky Left Sub-nav */}
          <aside className="lg:col-span-3 sticky top-24 hidden lg:block card-soft p-4 space-y-1 bg-white text-xs">
            <div className="text-[11px] font-bold text-[#7A8FA3] uppercase tracking-wider px-3 py-2 border-b border-[#D5E2EC] mb-2">
              Architecture Index
            </div>
            {subNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                  activeSection === item.id
                    ? 'bg-[#EAF2F8] text-[#0F6FA8] font-bold'
                    : 'text-[#4A6178] hover:text-[#0B2540] hover:bg-[#F5F9FC]'
                }`}
              >
                <span>{item.label}</span>
                {activeSection === item.id && <span className="w-1.5 h-1.5 rounded-full bg-[#0F6FA8]" />}
              </button>
            ))}
          </aside>

          {/* Right Main Deep-Dive Content */}
          <main className="lg:col-span-9 space-y-12">
            {/* 1. Architecture Overview (Clean Light SVG) */}
            <section id="arch-overview" className="scroll-mt-24 space-y-4">
              <div>
                <h2 className="font-heading font-bold text-2xl text-[#0B2540]">
                  Architecture Overview
                </h2>
                <p className="text-sm text-[#4A6178]">
                  Hand-built 3-layer serverless architecture. Click any node to inspect role, sizing, and IAM policies.
                </p>
              </div>

              {/* Hand-built Clean Light SVG Diagram */}
              <div className="card-soft p-4 bg-white overflow-hidden">
                <svg viewBox="0 0 940 540" className="w-full h-auto">
                  <defs>
                    <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#0F6FA8" />
                    </marker>
                    <marker id="arrow-teal" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#12A594" />
                    </marker>
                    <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#B54708" />
                    </marker>
                  </defs>

                  {/* Layer 1 Band */}
                  <rect x="20" y="25" width="900" height="155" rx="12" fill="#F5F9FC" stroke="#D5E2EC" />
                  <text x="35" y="50" fill="#0F6FA8" fontSize="11" fontWeight="bold">
                    LAYER 1: TRIGGER & VALIDATION (API Gateway → Lambda → SQS Fan-Out)
                  </text>

                  {/* Layer 2 Band */}
                  <rect x="20" y="195" width="900" height="155" rx="12" fill="#F5F9FC" stroke="#D5E2EC" />
                  <text x="35" y="220" fill="#12A594" fontSize="11" fontWeight="bold">
                    LAYER 2: TELEPHONY & AUDIO BRIDGE (Exotel Telephony ↔ WebSocket Bridge ↔ ElevenLabs)
                  </text>

                  {/* Layer 3 Band */}
                  <rect x="20" y="365" width="900" height="155" rx="12" fill="#F5F9FC" stroke="#D5E2EC" />
                  <text x="35" y="390" fill="#B54708" fontSize="11" fontWeight="bold">
                    LAYER 3: INTELLIGENCE & PERSISTENCE (Bedrock Guardrails → DynamoDB → SNS Notify)
                  </text>

                  {/* Layer 1 Connectors (L to R) */}
                  <path d="M 190,105 L 214,105" stroke="#0F6FA8" strokeWidth="2" markerEnd="url(#arrow-blue)" />
                  <path d="M 370,105 L 394,105" stroke="#0F6FA8" strokeWidth="2" markerEnd="url(#arrow-blue)" />
                  <path d="M 550,105 L 574,105" stroke="#0F6FA8" strokeWidth="2" markerEnd="url(#arrow-blue)" />
                  <path d="M 730,105 L 754,105" stroke="#0F6FA8" strokeWidth="2" markerEnd="url(#arrow-blue)" />
                  <path d="M 190,155 L 394,115" stroke="#0F6FA8" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow-blue)" />

                  {/* Vertical Transfer L1 to L2 */}
                  <path d="M 835,130 L 835,239" stroke="#0F6FA8" strokeWidth="2" markerEnd="url(#arrow-blue)" />

                  {/* Layer 2 Connectors (R to L) */}
                  <path d="M 760,270 L 736,270" stroke="#12A594" strokeWidth="2" markerEnd="url(#arrow-teal)" />
                  <path d="M 580,270 L 556,270" stroke="#12A594" strokeWidth="2" markerEnd="url(#arrow-teal)" />
                  <path d="M 400,270 L 376,270" stroke="#12A594" strokeWidth="2" markerEnd="url(#arrow-teal)" />

                  {/* Vertical Transfer L2 to L3 */}
                  <path d="M 295,295 L 295,409" stroke="#12A594" strokeWidth="2" markerEnd="url(#arrow-teal)" />

                  {/* Layer 3 Connectors (L to R) */}
                  <path d="M 370,440 L 394,440" stroke="#B54708" strokeWidth="2" markerEnd="url(#arrow-amber)" />
                  <path d="M 550,440 L 574,440" stroke="#B54708" strokeWidth="2" markerEnd="url(#arrow-amber)" />
                  <path d="M 730,440 L 754,440" stroke="#B54708" strokeWidth="2" markerEnd="url(#arrow-amber)" />

                  {/* Nodes */}
                  {ARCHITECTURE_NODES.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const isRoadmap = node.status === 'roadmap';

                    return (
                      <g
                        key={node.id}
                        onClick={() => handleNodeClick(node)}
                        className="cursor-pointer group"
                      >
                        <rect
                          x={node.coords.x}
                          y={node.coords.y}
                          width="150"
                          height="50"
                          rx="8"
                          fill={isSelected ? '#DCEEFA' : '#FFFFFF'}
                          stroke={isSelected ? '#0F6FA8' : isRoadmap ? '#B54708' : '#D5E2EC'}
                          strokeWidth={isSelected ? '2' : '1'}
                          strokeDasharray={isRoadmap ? '3 3' : 'none'}
                        />
                        <text
                          x={node.coords.x + 10}
                          y={node.coords.y + 20}
                          fill="#0B2540"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {node.name}
                        </text>
                        <text
                          x={node.coords.x + 10}
                          y={node.coords.y + 36}
                          fill="#4A6178"
                          fontSize="8.5"
                        >
                          {node.service}
                        </text>
                        {isRoadmap && (
                          <text
                            x={node.coords.x + 102}
                            y={node.coords.y + 14}
                            fill="#B54708"
                            fontSize="7.5"
                            fontWeight="bold"
                          >
                            ROADMAP
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </section>

            {/* 2. AWS Components Used (Accordion / Progressive Disclosure) */}
            <section id="aws-services" className="scroll-mt-24 card-soft p-6 bg-white space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('awsServices')}
              >
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#0B2540]">
                    AWS Components Breakdown
                  </h3>
                  <p className="text-xs text-[#4A6178]">
                    Serverless infrastructure with least-privilege IAM and CloudWatch monitoring.
                  </p>
                </div>
                {expandedSections.awsServices ? <ChevronUp className="w-5 h-5 text-[#4A6178]" /> : <ChevronDown className="w-5 h-5 text-[#4A6178]" />}
              </div>

              {expandedSections.awsServices && (
                <div className="pt-4 border-t border-[#D5E2EC] space-y-4">
                  <div className="flex items-center gap-2">
                    {['all', 'built', 'roadmap'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setComponentFilter(f)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold capitalize cursor-pointer ${
                          componentFilter === f ? 'bg-[#0F6FA8] text-white' : 'bg-[#EAF2F8] text-[#4A6178]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredComponents.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleNodeClick(c)}
                        className="p-4 rounded-xl bg-[#F5F9FC] border border-[#D5E2EC] hover:border-[#0F6FA8] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-[#0B2540]">{c.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${c.status === 'built' ? 'bg-[#D1FADF] text-[#067647]' : 'bg-[#FEF0C7] text-[#B54708]'}`}>
                            {c.status}
                          </span>
                        </div>
                        <div className="text-xs text-[#0F6FA8] font-medium mb-1">{c.service}</div>
                        <p className="text-xs text-[#4A6178] line-clamp-2">{c.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 3. Trigger Layer Execution Flow (Accordion) */}
            <section id="trigger-flow" className="scroll-mt-24 card-soft p-6 bg-white space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('triggerFlow')}
              >
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#0B2540]">
                    Trigger Flow (7 Execution Steps)
                  </h3>
                  <p className="text-xs text-[#4A6178]">
                    POST /alert to SQS fan-out with 30-min dedup and validation guards.
                  </p>
                </div>
                {expandedSections.triggerFlow ? <ChevronUp className="w-5 h-5 text-[#4A6178]" /> : <ChevronDown className="w-5 h-5 text-[#4A6178]" />}
              </div>

              {expandedSections.triggerFlow && (
                <div className="pt-4 border-t border-[#D5E2EC] space-y-3">
                  {TRIGGER_LAYER_STEPS.map((s) => (
                    <div key={s.step} className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D5E2EC] flex items-start gap-3 text-xs">
                      <span className="w-6 h-6 rounded-md bg-[#DCEEFA] text-[#0F6FA8] font-bold flex items-center justify-center shrink-0">
                        {s.step}
                      </span>
                      <div>
                        <div className="font-bold text-[#0B2540] mb-0.5">{s.title} ({s.service})</div>
                        <p className="text-[#4A6178] leading-relaxed">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 4. Audio Transcoding Bridge (Accordion) */}
            <section id="audio-bridge" className="scroll-mt-24 card-soft p-6 bg-white space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('audioBridge')}
              >
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#0B2540]">
                    Audio Transcoding Bridge
                  </h3>
                  <p className="text-xs text-[#4A6178]">
                    The bridge relays telephony audio between Exotel and ElevenLabs, transcoding sample rates as needed (8 kHz telephony ↔ 16 kHz), and flushes buffered audio on barge-in.
                  </p>
                </div>
                {expandedSections.audioBridge ? <ChevronUp className="w-5 h-5 text-[#4A6178]" /> : <ChevronDown className="w-5 h-5 text-[#4A6178]" />}
              </div>

              {expandedSections.audioBridge && (
                <div className="pt-4 border-t border-[#D5E2EC] space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D5E2EC]">
                      <div className="font-bold text-[#0B2540] mb-1">Telephony Audio Stream</div>
                      <div className="text-[#4A6178]">{AUDIO_BRIDGE_SPECS.telecomFormat}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D5E2EC]">
                      <div className="font-bold text-[#0B2540] mb-1">Conversational Model</div>
                      <div className="text-[#4A6178]">{AUDIO_BRIDGE_SPECS.aiFormat}</div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#EAF2F8] border border-[#D5E2EC] text-[#0B2540]">
                    <strong>Architecture Note:</strong> {AUDIO_BRIDGE_SPECS.bridgeNote}
                  </div>
                </div>
              )}
            </section>

            {/* 5. Triage Logic & Data Models (Accordion) */}
            <section id="triage-data" className="scroll-mt-24 card-soft p-6 bg-white space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('triageData')}
              >
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#0B2540]">
                    Triage Logic & DynamoDB Schemas
                  </h3>
                  <p className="text-xs text-[#4A6178]">
                    Bedrock prompt guardrails, P1/P2/P3 routing table, and GSI indexes.
                  </p>
                </div>
                {expandedSections.triageData ? <ChevronUp className="w-5 h-5 text-[#4A6178]" /> : <ChevronDown className="w-5 h-5 text-[#4A6178]" />}
              </div>

              {expandedSections.triageData && (
                <div className="pt-4 border-t border-[#D5E2EC] space-y-4 text-xs">
                  {TRIAGE_LOGIC_RULES.map((r) => (
                    <div key={r.tier} className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D5E2EC]">
                      <div className="font-bold mb-1" style={{ color: r.color }}>{r.tier}</div>
                      <ul className="list-disc list-inside text-[#4A6178] mb-2 space-y-0.5">
                        {r.rules.map((rule, idx) => (
                          <li key={idx}>{rule}</li>
                        ))}
                      </ul>
                      <div className="text-[#0B2540] font-medium">Action: {r.routing}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 6. Safety & Resilience Matrix (Accordion) */}
            <section id="safety-resilience" className="scroll-mt-24 card-soft p-6 bg-white space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('resilience')}
              >
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#0B2540]">
                    Resilience & Failure Recovery Matrix
                  </h3>
                  <p className="text-xs text-[#4A6178]">
                    Exotel retry loops, SQS DLQ redrive, Bedrock timeout fallbacks, and conditional writes.
                  </p>
                </div>
                {expandedSections.resilience ? <ChevronUp className="w-5 h-5 text-[#4A6178]" /> : <ChevronDown className="w-5 h-5 text-[#4A6178]" />}
              </div>

              {expandedSections.resilience && (
                <div className="pt-4 border-t border-[#D5E2EC] space-y-3 text-xs">
                  {RESILIENCE_MATRIX.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D5E2EC]">
                      <div className="font-bold text-[#D92D20] mb-1">{item.failureMode}</div>
                      <p className="text-[#4A6178]">{item.mitigation}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 7. Roadmap (Accordion) */}
            <section id="roadmap" className="scroll-mt-24 card-soft p-6 bg-white space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('roadmap')}
              >
                <div>
                  <h3 className="font-heading font-bold text-lg text-[#0B2540]">
                    Roadmap & Future Extensions
                  </h3>
                  <p className="text-xs text-[#4A6178]">
                    EventBridge CWC integration, regional dialect models, and multi-hazard expansions.
                  </p>
                </div>
                {expandedSections.roadmap ? <ChevronUp className="w-5 h-5 text-[#4A6178]" /> : <ChevronDown className="w-5 h-5 text-[#4A6178]" />}
              </div>

              {expandedSections.roadmap && (
                <div className="pt-4 border-t border-[#D5E2EC] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D5E2EC]">
                    <div className="font-bold text-[#0B2540] mb-1">CWC Gauge EventBridge Trigger</div>
                    <p className="text-[#4A6178]">Autonomous webhook alert from Central Water Commission river sensors without human trigger click.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D5E2EC]">
                    <div className="font-bold text-[#0B2540] mb-1">Bhojpuri & Maithili Dialect Tuning</div>
                    <p className="text-[#4A6178]">Localized speech synthesis models for eastern Bihar and UP flood belts.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D5E2EC]">
                    <div className="font-bold text-[#0B2540] mb-1">Heatwave & Air Quality Warnings</div>
                    <p className="text-[#4A6178]">Roadmap: warn residents and collect their status during heatwaves / poor air quality.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D5E2EC]">
                    <div className="font-bold text-[#0B2540] mb-1">Cognito RBAC & Official Audits</div>
                    <p className="text-[#4A6178]">MFA operator authentication and automated confirmation feeds for district officers.</p>
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Right-Side Drawer for Node Details */}
      {drawerOpen && selectedNode && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs" onClick={() => setDrawerOpen(false)}>
          <div
            className="w-full max-w-md bg-white border-l border-[#D5E2EC] h-full overflow-y-auto p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E2EC]">
              <div>
                <span className="text-[11px] font-mono text-[#0F6FA8] uppercase font-bold">Node Details</span>
                <h3 className="font-heading font-bold text-lg text-[#0B2540]">{selectedNode.name}</h3>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-md text-[#7A8FA3] hover:text-[#0B2540]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#F5F9FC] border border-[#D5E2EC]">
                <span className="text-[#7A8FA3] block text-[11px]">Service:</span>
                <span className="font-bold text-[#0B2540]">{selectedNode.service}</span>
              </div>

              <div>
                <span className="text-[#7A8FA3] block text-[11px] mb-1">Role:</span>
                <p className="text-[#0B2540] bg-[#F5F9FC] p-3 rounded-xl border border-[#D5E2EC]">{selectedNode.role}</p>
              </div>

              <div>
                <span className="text-[#7A8FA3] block text-[11px] mb-1">Why this service:</span>
                <p className="text-[#0F6FA8] bg-[#EAF2F8] p-3 rounded-xl border border-[#D5E2EC] font-medium">{selectedNode.why}</p>
              </div>

              <div>
                <span className="text-[#7A8FA3] block text-[11px] mb-1">Configuration:</span>
                <p className="text-[#0B2540] bg-[#F5F9FC] p-3 rounded-xl border border-[#D5E2EC]">{selectedNode.config}</p>
              </div>

              <div>
                <span className="text-[#7A8FA3] block text-[11px] mb-1">IAM Least-Privilege Scope:</span>
                <p className="text-[#067647] bg-[#D1FADF] p-3 rounded-xl border border-[#A6F4C5] font-mono text-[11px]">{selectedNode.iamNote}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
