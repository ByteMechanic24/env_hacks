import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Play } from 'lucide-react';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Problem', id: 'problem' },
    { label: 'Simulation', id: 'simulation' },
    { label: 'How it works', id: 'how' },
  ];

  const handleNavClick = (id) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-[#D5E2EC]">
        <div className="site-container h-full flex items-center justify-between">
          {/* Left: Waveform Logo + "Sentinel" on ONE line */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-[#0B2540] hover:text-[#0F6FA8] transition-colors"
            aria-label="Project Sentinel Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#DCEEFA] flex items-center justify-center gap-0.5 px-1.5" aria-hidden="true">
              <span className="w-1 bg-[#12A594] rounded-full wave-bar-1" />
              <span className="w-1 bg-[#12A594] rounded-full wave-bar-2" />
              <span className="w-1 bg-[#12A594] rounded-full wave-bar-3" />
              <span className="w-1 bg-[#12A594] rounded-full wave-bar-4" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-[#0B2540]">
              Sentinel
            </span>
          </Link>

          {/* Center: 3 links only (Problem, Simulation, How it works) */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="text-[15px] font-medium text-[#4A6178] hover:text-[#0B2540] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: Primary "Watch it work" + Secondary "Technical Approach" */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => handleNavClick('simulation')}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[12px] bg-[#0F6FA8] hover:bg-[#0B5A8A] text-white font-semibold text-sm transition-all hover:-translate-y-[1px] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch it work</span>
            </button>

            <Link
              to="/technical"
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-[12px] bg-white hover:bg-[#F5F9FC] border border-[#0F6FA8] text-[#0F6FA8] font-semibold text-sm transition-all hover:-translate-y-[1px] cursor-pointer group"
            >
              <span>Technical Approach</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-[#0B2540] hover:bg-[#EAF2F8]"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-16 left-0 right-0 bg-white border-b border-[#D5E2EC] p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="text-left py-2 text-base font-medium text-[#0B2540] hover:text-[#0F6FA8]"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-[#D5E2EC] flex flex-col gap-2.5">
              <button
                onClick={() => handleNavClick('simulation')}
                className="w-full h-11 rounded-[12px] bg-[#0F6FA8] text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch it work</span>
              </button>
              <Link
                to="/technical"
                onClick={() => setMobileOpen(false)}
                className="w-full h-11 rounded-[12px] bg-white border border-[#0F6FA8] text-[#0F6FA8] font-semibold text-sm flex items-center justify-center gap-1.5"
              >
                <span>Technical Approach</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
