import React from 'react';
import { Navbar } from '../components/home/Navbar';
import { Hero } from '../components/home/Hero';
import { ProblemSection } from '../components/home/ProblemSection';
import { WhatWeBuilt } from '../components/home/WhatWeBuilt';
import { SimulationSection } from '../components/home/SimulationSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { WhyItWinsSection } from '../components/home/WhyItWinsSection';
import { Footer } from '../components/home/Footer';

export function HomePage() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9FC] text-[#0B2540]">
      <Navbar />
      {/* pt-16 ensures content starts below the fixed h-16 navbar without overlap */}
      <main id="main-content" className="pt-16">
        <Hero onScrollToSimulation={() => scrollToSection('simulation')} />
        <ProblemSection onScrollToSolution={() => scrollToSection('solution')} />
        <WhatWeBuilt />
        <SimulationSection />
        <HowItWorksSection />
        <WhyItWinsSection onScrollToSimulation={() => scrollToSection('simulation')} />
      </main>
      <Footer />
    </div>
  );
}
