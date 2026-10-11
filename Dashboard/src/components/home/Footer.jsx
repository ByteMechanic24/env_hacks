import React from 'react';

export function Footer() {
  return (
    <footer className="py-8 bg-white border-t border-[#D5E2EC] text-xs text-[#7A8FA3]">
      <div className="site-container flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span className="font-semibold text-[#0B2540]">Project Awaaz</span> 
        </div>
        <p className="text-xs text-[#4A6178]">
          Awaaz informs and triages. It does not dispatch rescue or relief.
        </p>
      </div>
    </footer>
  );
}
