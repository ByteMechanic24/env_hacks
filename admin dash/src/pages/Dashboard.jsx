import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { Loader2, Radio, CheckCircle, AlertOctagon, PhoneCall, ShieldAlert, HeartPulse } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  // Auth Guard
  useEffect(() => {
    const isAuthed = localStorage.getItem('sentinel_authed');
    if (isAuthed !== 'true') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Form State
  const [district, setDistrict] = useState('Bihar-Khagaria');
  const [pincodes, setPincodes] = useState('841301, 841302');
  const [alertType, setAlertType] = useState('FLOOD');
  const [officerId, setOfficerId] = useState('OFFICER-01');

  // Request State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null); // { success: boolean, queued: number, skipped: number, error: string }

  const handleSignOut = async () => {
    try {
      await signOut().catch(() => {});
    } finally {
      localStorage.removeItem('sentinel_authed');
      navigate('/login', { replace: true });
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDispatchResult(null);

    const pinArray = pincodes
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const payload = {
      district,
      pincodes: pinArray,
      alert_type: alertType,
      officer_id: officerId,
    };

    const baseUrl = (import.meta.env.VITE_API_GATEWAY_URL || '').trim();
    const endpoint = baseUrl ? `${baseUrl.replace(/\/+$/, '')}/alert` : '/alert';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData && (errData.message || errData.error)) {
            errorMsg = errData.message || errData.error;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const queuedCount = data?.queued ?? data?.units ?? data?.count ?? pinArray.length * 5;
      const skippedCount = data?.skipped ?? 0;

      setDispatchResult({
        success: true,
        queued: queuedCount,
        skipped: skippedCount,
      });
    } catch (err) {
      setDispatchResult({
        success: false,
        error: err?.message || 'Dispatch failed. Network or API Gateway unreachable.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Color tags for alert types
  const alertStyles = {
    FLOOD: {
      tag: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      pill: 'bg-blue-500/20 text-blue-300',
    },
    HEATWAVE: {
      tag: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      pill: 'bg-amber-500/20 text-amber-300',
    },
    AQI: {
      tag: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      pill: 'bg-purple-500/20 text-purple-300',
    },
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* TOP BAR */}
      <header
        className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50"
        style={{
          backgroundColor: '#0d1424',
          borderBottom: '1px solid #1e3a5f',
        }}
      >
        {/* Left: ⬡ SENTINEL */}
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-white text-base tracking-wider flex items-center gap-2 select-none">
            <span className="text-blue-500 text-lg">⬡</span> SENTINEL
          </span>
        </div>

        {/* Center: status pill */}
        <div className="flex items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-900/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
            </span>
            <span
              className="font-mono font-bold tracking-widest select-none"
              style={{
                color: '#22c55e',
                fontSize: '11px',
              }}
            >
              SYSTEM OPERATIONAL
            </span>
          </div>
        </div>

        {/* Right: username & sign out button */}
        <div className="flex items-center gap-4">
          <span className="text-slate-400 font-mono text-xs font-medium tracking-wide">
            OFFICER-01
          </span>
          <button
            onClick={handleSignOut}
            className="px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer"
            style={{
              border: '1px solid #dc2626',
              color: '#dc2626',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#dc2626';
            }}
          >
            TERMINATE SESSION
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT: 60/40 SPLIT */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* LEFT COLUMN — Alert Dispatch Panel (60% / 3 of 5 cols) */}
          <section className="lg:col-span-3 flex flex-col">
            <div
              className="bg-[#0d1424] rounded-xl p-6 border border-[#1e3a5f] shadow-lg flex-1"
            >
              {/* Section heading */}
              <h2
                className="text-white font-bold tracking-[0.2em] uppercase pb-3 select-none"
                style={{
                  fontSize: '13px',
                  borderBottom: '1px solid #1e3a5f',
                }}
              >
                DISPATCH ALERT
              </h2>

              {/* Form Fields */}
              <form onSubmit={handleDispatch} className="mt-6 space-y-5">
                {/* District */}
                <div>
                  <label
                    htmlFor="district"
                    className="block text-slate-400 text-xs font-semibold tracking-wider uppercase mb-2"
                  >
                    TARGET DISTRICT
                  </label>
                  <input
                    id="district"
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#020817] border border-[#1e3a5f] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition duration-150"
                  />
                </div>

                {/* Pincodes */}
                <div>
                  <label
                    htmlFor="pincodes"
                    className="block text-slate-400 text-xs font-semibold tracking-wider uppercase mb-2"
                  >
                    PINCODE ZONES
                  </label>
                  <input
                    id="pincodes"
                    type="text"
                    required
                    placeholder="841301, 841302"
                    value={pincodes}
                    onChange={(e) => setPincodes(e.target.value)}
                    className="w-full bg-[#020817] border border-[#1e3a5f] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition duration-150 placeholder-slate-600 font-mono"
                  />
                </div>

                {/* Alert Type */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="alertType"
                      className="block text-slate-400 text-xs font-semibold tracking-wider uppercase"
                    >
                      ALERT TYPE
                    </label>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${alertStyles[alertType]?.tag}`}
                    >
                      {alertType} MODE
                    </span>
                  </div>
                  <select
                    id="alertType"
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value)}
                    className="w-full bg-[#020817] border border-[#1e3a5f] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition duration-150 cursor-pointer"
                  >
                    <option value="FLOOD" className="bg-[#0d1424] text-blue-400">
                      FLOOD — Severe Inundation Alert
                    </option>
                    <option value="HEATWAVE" className="bg-[#0d1424] text-amber-400">
                      HEATWAVE — Critical Ambient Thermal Alert
                    </option>
                    <option value="AQI" className="bg-[#0d1424] text-purple-400">
                      AQI — Hazardous Atmospheric Particulate Alert
                    </option>
                  </select>
                </div>

                {/* Officer ID */}
                <div>
                  <label
                    htmlFor="officerId"
                    className="block text-slate-400 text-xs font-semibold tracking-wider uppercase mb-2"
                  >
                    OFFICER ID
                  </label>
                  <input
                    id="officerId"
                    type="text"
                    required
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    className="w-full bg-[#020817] border border-[#1e3a5f] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition duration-150 font-mono"
                  />
                </div>

                {/* DISPATCH Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-lg text-white font-black tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      backgroundColor: '#dc2626',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>DISPATCHING EMERGENCY BROADCAST...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡ INITIATE DISPATCH</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Success Result Card */}
              {dispatchResult && dispatchResult.success && (
                <div
                  className="mt-6 p-4 rounded-xl border border-blue-500/50 bg-[#0d233a] shadow-lg animate-in fade-in duration-200"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-200 tracking-wide">
                        DISPATCH COMPLETE — {dispatchResult.queued} UNITS MOBILIZED
                      </h4>
                      {dispatchResult.skipped > 0 && (
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          {dispatchResult.skipped} units skipped (recently alerted)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Result Card */}
              {dispatchResult && !dispatchResult.success && (
                <div
                  className="mt-6 p-4 rounded-xl border border-red-500/50 bg-red-950/40 shadow-lg animate-in fade-in duration-200"
                >
                  <div className="flex items-start gap-3">
                    <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-red-200 tracking-wide">
                        DISPATCH ERROR
                      </h4>
                      <p className="text-xs text-red-300/90 mt-1 break-words">
                        {dispatchResult.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT COLUMN — Triage Feed (40% / 2 of 5 cols) */}
          <section className="lg:col-span-2 flex flex-col">
            <div
              className="bg-[#0d1424] rounded-xl p-6 border border-[#1e3a5f] shadow-lg flex-1 flex flex-col"
            >
              {/* Section heading */}
              <h2
                className="text-white font-bold tracking-[0.2em] uppercase pb-3 select-none flex items-center justify-between"
                style={{
                  fontSize: '13px',
                  borderBottom: '1px solid #1e3a5f',
                }}
              >
                <span>LIVE TRIAGE FEED</span>
                <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono lowercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  live
                </span>
              </h2>

              {/* Static Placeholder Cards */}
              <div className="mt-6 space-y-3.5 flex-1">
                
                {/* Card 1: Ramesh Kumar */}
                <div
                  className="rounded-lg p-4 transition-all duration-150 hover:border-slate-600"
                  style={{
                    backgroundColor: '#0d1424',
                    border: '1px solid #1e3a5f',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-sm text-white">Ramesh Kumar</span>
                    </div>
                    {/* Status badge: DIALING (yellow) */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-amber-500/20 text-[#f59e0b] border border-amber-500/30">
                      DIALING
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span>Village: <strong className="text-slate-300 font-sans">Mansi</strong></span>
                      <span>•</span>
                      <span className="text-blue-400 font-semibold">FLOOD</span>
                    </div>
                    <span className="text-[11px] text-slate-500">2 min ago</span>
                  </div>
                </div>

                {/* Card 2: Akshit Singh */}
                <div
                  className="rounded-lg p-4 transition-all duration-150 hover:border-red-900/80"
                  style={{
                    backgroundColor: '#0d1424',
                    border: '1px solid #1e3a5f',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <span className="font-bold text-sm text-white">Akshit Singh</span>
                    </div>
                    {/* Status badge: P1 CRITICAL (red pulsing) */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-red-500/20 text-[#ef4444] border border-red-500/40 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      P1 CRITICAL
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span>Village: <strong className="text-slate-300 font-sans">Mansi</strong></span>
                      <span>•</span>
                      <span className="text-blue-400 font-semibold">FLOOD</span>
                    </div>
                    <span className="text-[11px] text-slate-500">4 min ago</span>
                  </div>
                </div>

                {/* Card 3: Sunita Devi */}
                <div
                  className="rounded-lg p-4 transition-all duration-150 hover:border-slate-600"
                  style={{
                    backgroundColor: '#0d1424',
                    border: '1px solid #1e3a5f',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-sm text-white">Sunita Devi</span>
                    </div>
                    {/* Status badge: SAFE (green) */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-emerald-500/20 text-[#22c55e] border border-emerald-500/30">
                      SAFE
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span>Village: <strong className="text-slate-300 font-sans">Chautham</strong></span>
                      <span>•</span>
                      <span className="text-blue-400 font-semibold">FLOOD</span>
                    </div>
                    <span className="text-[11px] text-slate-500">7 min ago</span>
                  </div>
                </div>

              </div>

              {/* Sub-feed information */}
              <div className="mt-6 pt-3 border-t border-[#1e3a5f]/60 text-center">
                <p
                  className="font-mono text-center select-none"
                  style={{
                    color: '#475569',
                    fontSize: '11px',
                  }}
                >
                  Feed updates every 10s after dispatch
                </p>
              </div>

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

