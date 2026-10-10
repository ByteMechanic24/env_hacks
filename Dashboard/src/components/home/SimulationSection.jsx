import React, { useState, useEffect } from 'react';
import { 
  SEEDED_RESIDENTS, 
  SIMULATION_SCENARIOS 
} from '../../data/simulationScenarios';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Phone, 
  Check, 
  X, 
  Layers, 
  Radio, 
  AlertCircle,
  FileCode2,
  Sliders,
  ChevronRight
} from 'lucide-react';

const PIPELINE_NODES = [
  { id: 'api_gw', name: 'API Gateway', role: 'POST /alert' },
  { id: 'validation', name: 'Validation Guard', role: '30-min dedup' },
  { id: 'sqs', name: 'SQS Queue', role: 'awaaz-calls' },
  { id: 'call_worker', name: 'Call (Exotel)', role: 'Voice Outbound' },
  { id: 'elevenlabs', name: 'Voice (ElevenLabs)', role: 'Hindi Agent' },
  { id: 'bedrock', name: 'Triage & Notify', role: 'Claude 3.5' },
];

export function SimulationSection() {
  const [selectedScenarioId, setSelectedScenarioId] = useState('p1_roof');
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedPin, setSelectedPin] = useState(null);
  const [languageMode, setLanguageMode] = useState('both'); // 'both', 'hindi', 'english'

  // Form state
  const [district, setDistrict] = useState('Bihar–Khagaria');
  const [pincodes, setPincodes] = useState({ '841301': true, '841302': true });

  // Map pins status
  const [pinStatusMap, setPinStatusMap] = useState({
    'RES-101': 'Pending',
    'RES-102': 'Pending',
    'RES-103': 'Pending',
    'RES-104': 'Pending',
    'RES-105': 'Pending',
    'RES-106': 'Pending',
    'RES-107': 'Pending',
    'RES-108': 'Pending',
    'RES-109': 'Pending',
    'RES-110': 'Pending',
  });

  const scenario = SIMULATION_SCENARIOS.find((s) => s.id === selectedScenarioId) || SIMULATION_SCENARIOS[0];
  const currentStep = scenario.timeline[stepIndex] || scenario.timeline[0];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      const nextStep = stepIndex + 1;
      if (nextStep < scenario.timeline.length) {
        const currentEvent = scenario.timeline[stepIndex];
        const nextEvent = scenario.timeline[nextStep];
        const delay = ((nextEvent.t - currentEvent.t) * 1000) / playbackSpeed;

        timer = setTimeout(() => {
          setStepIndex(nextStep);
          if (nextEvent.pinUpdate) {
            setPinStatusMap((prev) => ({
              ...prev,
              [nextEvent.pinUpdate.id]: nextEvent.pinUpdate.status,
            }));
          }
        }, Math.max(delay, 900));
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, scenario, playbackSpeed]);

  const handleScenarioChange = (id) => {
    setSelectedScenarioId(id);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    if (stepIndex < scenario.timeline.length - 1) {
      const nextStep = stepIndex + 1;
      setStepIndex(nextStep);
      const nextEvent = scenario.timeline[nextStep];
      if (nextEvent.pinUpdate) {
        setPinStatusMap((prev) => ({
          ...prev,
          [nextEvent.pinUpdate.id]: nextEvent.pinUpdate.status,
        }));
      }
    }
  };

  const handleInitiateAlert = () => {
    setStepIndex(0);
    setIsPlaying(true);
  };

  // Dialogues up to step
  const activeDialogues = scenario.timeline
    .slice(0, stepIndex + 1)
    .filter((e) => e.speech !== null)
    .map((e) => e.speech);

  // Recent 3 logs for compact ticker
  const activeLogs = scenario.timeline.slice(0, stepIndex + 1).map((e) => e.log);
  const recentLogs = activeLogs.slice(-3);

  // Counter counts
  const counts = {
    P1: Object.values(pinStatusMap).filter((s) => s === 'P1').length,
    P2: Object.values(pinStatusMap).filter((s) => s === 'P2').length,
    P3: Object.values(pinStatusMap).filter((s) => s === 'P3').length,
    Pending: Object.values(pinStatusMap).filter((s) => s === 'Pending').length,
  };

  return (
    <section id="simulation" className="py-20 md:py-28 bg-[#F5F9FC] border-b border-[#D5E2EC]">
      <div className="site-container">
        {/* Enclosing Single White Card */}
        <div className="bg-white border border-[#D5E2EC] rounded-[24px] p-6 md:p-8 shadow-soft">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#D5E2EC] gap-3">
            <div>
              <h2 className="font-heading font-bold text-2xl text-[#0B2540]">
                Live simulation
              </h2>
              <p className="text-sm text-[#4A6178]">
                Scripted playback of the two-way voice triage pipeline.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2F8] border border-[#D5E2EC] text-xs text-[#4A6178] self-start sm:self-auto font-medium">
              <span className="w-2 h-2 rounded-full bg-[#12A594]" />
              <span>Simulated playback, scripted from our real call flow</span>
            </span>
          </div>

          {/* Controls Row: Scenario pill tabs + Playback controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-[#D5E2EC]">
            {/* Scenario Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'p1_roof', label: 'Trapped on roof P1' },
                { id: 'p2_elderly', label: 'Elderly needs medicine P2' },
                { id: 'p3_safe', label: 'Already safe P3' },
                { id: 'dlq_retry', label: 'No answer, retry, DLQ' },
              ].map((tab) => {
                const isActive = selectedScenarioId === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleScenarioChange(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0F6FA8] text-white font-semibold shadow-sm'
                        : 'bg-[#F5F9FC] hover:bg-[#EAF2F8] text-[#4A6178] border border-[#D5E2EC]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Play/Pause, Step, Speed, Reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[12px] bg-[#0F6FA8] hover:bg-[#0B5A8A] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play Flow'}</span>
              </button>

              <button
                onClick={handleStepForward}
                disabled={isPlaying || stepIndex >= scenario.timeline.length - 1}
                className="h-9 px-3 rounded-[12px] bg-white border border-[#D5E2EC] text-[#4A6178] hover:text-[#0B2540] disabled:opacity-40 cursor-pointer text-xs font-medium"
                title="Step forward"
              >
                <FastForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1)}
                className="h-9 px-3 rounded-[12px] bg-white border border-[#D5E2EC] text-[#0F6FA8] font-mono text-xs font-bold cursor-pointer"
                title="Toggle speed"
              >
                {playbackSpeed}x
              </button>

              <button
                onClick={handleReset}
                className="h-9 px-3 rounded-[12px] bg-white border border-[#D5E2EC] text-[#4A6178] hover:text-[#0B2540] cursor-pointer"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3 Columns Desktop Grid (12-col: 3 / 5 / 4, strictly bounded with min-w-0) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-w-0">
            {/* COLUMN 1: Officer Console (3 cols) */}
            <div className="lg:col-span-3 min-w-0 bg-[#F5F9FC] border border-[#D5E2EC] rounded-[16px] p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D5E2EC]">
                  <span className="font-heading font-bold text-sm text-[#0B2540]">
                    Officer Console
                  </span>
                  <span className="text-[11px] font-medium text-[#067647] bg-[#D1FADF] px-2 py-0.5 rounded">
                    Online
                  </span>
                </div>

                <div className="space-y-3.5 mb-5">
                  <div>
                    <label className="text-xs text-[#4A6178] font-medium block mb-1">
                      District:
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-white border border-[#D5E2EC] rounded-lg p-2 text-xs text-[#0B2540] outline-none truncate"
                    >
                      <option value="Bihar–Khagaria">Bihar – Khagaria (Kosi Basin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#4A6178] font-medium block mb-1">
                      Pincodes:
                    </label>
                    <div className="space-y-2 bg-white p-2.5 rounded-lg border border-[#D5E2EC] text-xs">
                      <label className="flex items-center gap-2 text-[#0B2540] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={pincodes['841301']}
                          onChange={(e) => setPincodes({ ...pincodes, '841301': e.target.checked })}
                          className="accent-[#0F6FA8] shrink-0 w-3.5 h-3.5 rounded"
                        />
                        <span className="font-mono font-medium">841301</span>
                        <span className="text-[#4A6178] text-[11px] truncate">(Sonbarsa Ghat)</span>
                      </label>
                      <label className="flex items-center gap-2 text-[#0B2540] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={pincodes['841302']}
                          onChange={(e) => setPincodes({ ...pincodes, '841302': e.target.checked })}
                          className="accent-[#0F6FA8] shrink-0 w-3.5 h-3.5 rounded"
                        />
                        <span className="font-mono font-medium">841302</span>
                        <span className="text-[#4A6178] text-[11px] truncate">(Mansi Island)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#4A6178] font-medium block mb-1">
                      Hazard:
                    </label>
                    <div className="p-2.5 rounded-lg bg-white border border-[#D5E2EC] text-xs font-semibold text-[#D92D20]">
                      FLOOD ALERT (Level 3)
                    </div>
                  </div>
                </div>

                {/* Primary Button */}
                <button
                  onClick={handleInitiateAlert}
                  className="w-full h-10 rounded-[12px] bg-[#0F6FA8] hover:bg-[#0B5A8A] text-white font-semibold text-xs tracking-wide uppercase transition-all shadow-sm cursor-pointer"
                >
                  Initiate Alert
                </button>
              </div>

              {/* 3 Small Facts under button */}
              <div className="pt-3 mt-4 border-t border-[#D5E2EC] text-xs text-[#4A6178] space-y-1">
                <div className="flex justify-between">
                  <span>Scope:</span>
                  <span className="font-semibold text-[#0B2540]">10 households</span>
                </div>
                <div className="flex justify-between">
                  <span>Dedup:</span>
                  <span className="font-semibold text-[#0B2540]">30-min window</span>
                </div>
                <div className="flex justify-between">
                  <span>Worker:</span>
                  <span className="font-semibold text-[#0B2540]">Parallel dialing</span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Pipeline (5 cols, strictly bounded with min-w-0 and overflow-hidden) */}
            <div className="lg:col-span-5 min-w-0 bg-[#F5F9FC] border border-[#D5E2EC] rounded-[16px] p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D5E2EC]">
                  <span className="font-heading font-bold text-sm text-[#0B2540]">
                    Pipeline
                  </span>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-[#4A6178]">
                      SQS: <strong className="text-[#0F6FA8]">{currentStep.sqsCount}</strong>
                    </span>
                    <span className="text-[#4A6178]">
                      DLQ: <strong className={currentStep.dlqCount > 0 ? 'text-[#D92D20]' : 'text-[#7A8FA3]'}>{currentStep.dlqCount}</strong>
                    </span>
                  </div>
                </div>

                {/* Vertical chain of 6 grouped nodes */}
                <div className="space-y-2 mb-3">
                  {PIPELINE_NODES.map((node, i) => {
                    const isActive = currentStep.activeNode === node.id || (node.id === 'bedrock' && (currentStep.activeNode === 'bedrock' || currentStep.activeNode === 'sns' || currentStep.activeNode === 'dynamodb'));
                    return (
                      <div
                        key={node.id}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between min-w-0 ${
                          isActive
                            ? 'bg-[#DCEEFA] border-[#0F6FA8] text-[#0B2540] font-semibold shadow-xs'
                            : 'bg-white border-[#D5E2EC] text-[#4A6178]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 truncate">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isActive
                                ? 'bg-[#0F6FA8] text-white'
                                : 'bg-[#EAF2F8] text-[#7A8FA3]'
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="text-xs truncate">{node.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#7A8FA3] shrink-0 ml-2">{node.role}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Compact 3-line log ticker (monospace 11px, strictly contained) */}
              <div className="p-3 rounded-xl bg-white border border-[#D5E2EC] font-mono text-[11px] space-y-1 min-w-0 overflow-hidden">
                <div className="text-[10px] uppercase text-[#7A8FA3] font-bold pb-1 border-b border-[#D5E2EC] flex items-center justify-between">
                  <span>Event Telemetry</span>
                  <span className="text-[9px] text-[#0F6FA8] font-semibold">Step {stepIndex + 1}/{scenario.timeline.length}</span>
                </div>
                <div className="min-h-[54px] flex flex-col justify-end space-y-1 min-w-0 overflow-hidden">
                  {recentLogs.map((log, idx) => (
                    <div key={idx} className="truncate text-[#4A6178] leading-tight min-w-0 block" title={log}>
                      <span className="text-[#0F6FA8] mr-1 select-none">&gt;</span>
                      <span className={idx === recentLogs.length - 1 ? 'text-[#0B2540] font-semibold' : ''}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 3: Call + Map (4 cols, strictly bounded with min-w-0 and overflow-hidden) */}
            <div className="lg:col-span-4 min-w-0 bg-[#F5F9FC] border border-[#D5E2EC] rounded-[16px] p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
              {/* TOP: Phone Captions with Hindi / English toggle */}
              <div className="min-w-0">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D5E2EC]">
                  <span className="font-heading font-bold text-sm text-[#0B2540]">
                    Phone Dialogue
                  </span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-[#D5E2EC] text-[11px] shrink-0">
                    <button
                      onClick={() => setLanguageMode('both')}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        languageMode === 'both' ? 'bg-[#0F6FA8] text-white font-bold' : 'text-[#4A6178] hover:text-[#0B2540]'
                      }`}
                    >
                      Both
                    </button>
                    <button
                      onClick={() => setLanguageMode('hindi')}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        languageMode === 'hindi' ? 'bg-[#0F6FA8] text-white font-bold' : 'text-[#4A6178] hover:text-[#0B2540]'
                      }`}
                    >
                      हिन्दी
                    </button>
                    <button
                      onClick={() => setLanguageMode('english')}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        languageMode === 'english' ? 'bg-[#0F6FA8] text-white font-bold' : 'text-[#4A6178] hover:text-[#0B2540]'
                      }`}
                    >
                      Eng
                    </button>
                  </div>
                </div>

                {/* Dialogue Bubbles */}
                <div className="space-y-2 h-[150px] overflow-y-auto mb-3 p-1 min-w-0">
                  {activeDialogues.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-[#7A8FA3] italic">
                      [Waiting for call connect...]
                    </div>
                  ) : (
                    activeDialogues.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl text-xs ${
                          item.speaker === 'agent'
                            ? 'bg-[#DCEEFA] border border-[#0F6FA8]/20 text-[#0B2540]'
                            : item.speaker === 'resident'
                            ? 'bg-white border border-[#D5E2EC] text-[#0B2540]'
                            : 'bg-[#FEE4E2] border border-[#FECDCA] text-[#D92D20]'
                        }`}
                      >
                        <div className="text-[10px] font-bold text-[#0F6FA8] mb-0.5">
                          {item.speaker === 'agent' ? 'ElevenLabs Agent' : item.speaker === 'resident' ? 'Resident (Hindi)' : 'System'}
                        </div>
                        {(languageMode === 'both' || languageMode === 'hindi') && (
                          <div className="font-hindi text-[13px] leading-snug">
                            {item.hindi}
                          </div>
                        )}
                        {(languageMode === 'both' || languageMode === 'english') && (
                          <div className="text-[11px] text-[#4A6178] italic mt-0.5">
                            {item.english}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* BOTTOM: Light SVG River Map with 10 Pins */}
              <div className="min-w-0">
                {/* Counter row */}
                <div className="grid grid-cols-4 gap-1.5 mb-2 text-center text-xs font-semibold">
                  <div className="p-1 rounded bg-[#FEE4E2] text-[#D92D20]">
                    P1: {counts.P1}
                  </div>
                  <div className="p-1 rounded bg-[#FEF0C7] text-[#B54708]">
                    P2: {counts.P2}
                  </div>
                  <div className="p-1 rounded bg-[#D1FADF] text-[#067647]">
                    P3: {counts.P3}
                  </div>
                  <div className="p-1 rounded bg-white border border-[#D5E2EC] text-[#7A8FA3]">
                    Pend: {counts.Pending}
                  </div>
                </div>

                {/* Light SVG Map */}
                <div className="relative h-44 rounded-xl bg-white border border-[#D5E2EC] overflow-hidden p-2 min-w-0">
                  <svg viewBox="0 0 540 300" className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
                    {/* River line */}
                    <path
                      d="M -20,160 C 100,80 180,240 300,150 C 400,70 480,210 560,170"
                      fill="none"
                      stroke="#DCEEFA"
                      strokeWidth="36"
                    />
                    <path
                      d="M -20,160 C 100,80 180,240 300,150 C 400,70 480,210 560,170"
                      fill="none"
                      stroke="#0F6FA8"
                      strokeWidth="3"
                      strokeOpacity="0.5"
                    />

                    {/* 10 Resident Dots */}
                    {SEEDED_RESIDENTS.map((res) => {
                      const status = pinStatusMap[res.id];
                      let fill = '#7A8FA3';
                      if (status === 'P1') fill = '#D92D20';
                      if (status === 'P2') fill = '#B54708';
                      if (status === 'P3') fill = '#067647';
                      if (status === 'DLQ') fill = '#D92D20';

                      return (
                        <g
                          key={res.id}
                          className="cursor-pointer"
                          onClick={() => setSelectedPin({ ...res, status })}
                        >
                          {status === 'P1' && (
                            <circle
                              cx={res.coords.x}
                              cy={res.coords.y}
                              r="12"
                              fill="none"
                              stroke="#D92D20"
                              strokeWidth="2"
                              className="animate-ping"
                            />
                          )}
                          <circle
                            cx={res.coords.x}
                            cy={res.coords.y}
                            r={status === 'Pending' ? 5 : 7}
                            fill={fill}
                            stroke="#FFFFFF"
                            strokeWidth="2"
                          />
                          <text
                            x={res.coords.x + 8}
                            y={res.coords.y + 4}
                            fill="#0B2540"
                            fontSize="9"
                            fontFamily="sans-serif"
                            fontWeight="500"
                          >
                            {res.name.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Small JSON popover when pin is clicked */}
        {selectedPin && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedPin(null)}
          >
            <div
              className="bg-white border border-[#D5E2EC] rounded-[20px] max-w-md w-full p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D5E2EC]">
                <h3 className="font-heading font-bold text-base text-[#0B2540]">
                  Triage JSON • {selectedPin.name}
                </h3>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="p-1 rounded-md text-[#7A8FA3] hover:text-[#0B2540]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 rounded bg-[#F5F9FC]">
                  <span className="text-[#4A6178]">Priority:</span>
                  <span className={selectedPin.status === 'P1' ? 'text-[#D92D20] font-bold' : selectedPin.status === 'P2' ? 'text-[#B54708] font-bold' : 'text-[#067647] font-bold'}>
                    {selectedPin.status}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-[#F5F9FC]">
                  <span className="text-[#4A6178]">Location:</span>
                  <span className="text-[#0B2540]">{selectedPin.locationText}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-[#F5F9FC]">
                  <span className="text-[#4A6178]">Household:</span>
                  <span className="text-[#0B2540]">{selectedPin.householdSize} members</span>
                </div>
                <pre className="p-3 rounded-lg bg-[#EAF2F8] text-[#0B2540] text-[11px] overflow-x-auto mt-2">
{JSON.stringify(scenario.triageJson, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
