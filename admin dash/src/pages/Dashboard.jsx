import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthed = localStorage.getItem('sentinel_authed');
    if (isAuthed !== 'true') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#020817] text-white flex flex-col font-sans">
      <header className="px-6 py-3.5 flex items-center justify-between border-b border-[#1e3a5f] bg-[#0d1424]">
        <span className="font-mono font-bold text-white text-base tracking-wider flex items-center gap-2">
          <span className="text-blue-500 text-lg">⬡</span> SENTINEL
        </span>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-900/50">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
          <span className="text-[#22c55e] text-[11px] font-mono font-bold tracking-widest">SYSTEM OPERATIONAL</span>
        </div>
      </header>
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 bg-[#0d1424] rounded-xl p-6 border border-[#1e3a5f]">
          <h2 className="text-white font-bold tracking-[0.2em] text-[13px] border-b border-[#1e3a5f] pb-3 uppercase">DISPATCH ALERT</h2>
        </section>
        <section className="lg:col-span-2 bg-[#0d1424] rounded-xl p-6 border border-[#1e3a5f]">
          <h2 className="text-white font-bold tracking-[0.2em] text-[13px] border-b border-[#1e3a5f] pb-3 uppercase">LIVE TRIAGE FEED</h2>
        </section>
      </main>
    </div>
  );
}