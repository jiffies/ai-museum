import React, { useState, useRef, useEffect } from 'react';
import { STORY_SECTIONS } from './constants';
import { SimulationConfig } from './types';
import { SimulationCanvas } from './components/SimulationCanvas';
import { StatsChart } from './components/StatsChart';
import { ChevronDown, ChevronUp, RotateCcw, Sliders } from 'lucide-react';

const ControlSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  unit?: string;
  color?: string;
}> = ({ label, value, min, max, step, onChange, unit = '', color = 'accent-slate-600' }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-bold text-slate-900">{value > 0 && label === "Drift" ? '+' : ''}{value.toFixed(label === "Drift" ? 2 : 1)}{unit}</span>
    </div>
    <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${color}`}
    />
  </div>
);

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentSection = STORY_SECTIONS[currentStep];
  
  // State for dynamic config that starts as the story config but can be changed
  const [activeConfig, setActiveConfig] = useState<SimulationConfig>(currentSection.config);

  // Reset config when step changes
  useEffect(() => {
      setActiveConfig(currentSection.config);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STORY_SECTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleResetConfig = () => {
      setActiveConfig(currentSection.config);
  };

  const updateConfig = (key: keyof SimulationConfig, value: number) => {
      setActiveConfig(prev => ({ ...prev, [key]: value }));
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  return (
    <div className="relative w-full h-screen overflow-hidden flex bg-slate-50">
      
      {/* Left Panel - Story Content */}
      <div className="w-full md:w-1/3 lg:w-1/4 h-full z-20 bg-white/90 backdrop-blur-md border-r border-slate-200 flex flex-col shadow-xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 shrink-0">
          <h1 className="serif text-2xl font-bold text-slate-900 leading-tight">
            赌徒破产定理
          </h1>
          <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-semibold">
            Gambler's Ruin Theorem
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 relative" ref={contentRef}>
           <div className="transition-opacity duration-500 ease-in-out key={currentStep}">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl font-bold text-slate-200 serif">
                    {currentStep === 0 ? '00' : `0${currentStep}`}
                </span>
                <h2 className="text-xl font-bold text-slate-800 serif">
                    {currentSection.title}
                </h2>
              </div>
              
              <div className="prose prose-slate prose-sm mb-8">
                {currentSection.content}
              </div>

              {/* Interactive Controls Section */}
              <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl border border-slate-200/50">
                 <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Sliders size={14} className="text-slate-500" />
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Simulation Controls</h3>
                    </div>
                    <button 
                        onClick={handleResetConfig}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        title="Reset Parameters"
                    >
                        <RotateCcw size={14} />
                    </button>
                 </div>
                 
                 <div className="space-y-1">
                    <ControlSlider 
                        label="Drift (Bias)" 
                        value={activeConfig.drift} 
                        min={-1} max={1} step={0.1} 
                        onChange={(v) => updateConfig('drift', v)}
                        color={activeConfig.drift < 0 ? 'accent-red-500' : (activeConfig.drift > 0 ? 'accent-emerald-500' : 'accent-slate-500')}
                    />
                    <ControlSlider 
                        label="Volatility (Risk)" 
                        value={activeConfig.volatility} 
                        min={0.1} max={10} step={0.1} 
                        onChange={(v) => updateConfig('volatility', v)}
                    />
                    <ControlSlider 
                        label="Leverage (Multiplier)" 
                        value={activeConfig.leverage} 
                        min={1} max={50} step={1} 
                        unit="x"
                        onChange={(v) => updateConfig('leverage', v)}
                        color="accent-orange-500"
                    />
                    <ControlSlider 
                        label="Speed" 
                        value={activeConfig.simulationSpeed} 
                        min={0.5} max={10} step={0.5} 
                        unit="x"
                        onChange={(v) => updateConfig('simulationSpeed', v)}
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Navigation Controls */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 shrink-0">
            <div className="flex justify-between items-center gap-4">
                <button 
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronUp size={24} className="text-slate-700" />
                </button>
                
                <div className="flex gap-1">
                    {STORY_SECTIONS.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-slate-800 w-4' : 'bg-slate-300'}`}
                        />
                    ))}
                </div>

                <button 
                    onClick={handleNext}
                    disabled={currentStep === STORY_SECTIONS.length - 1}
                    className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronDown size={24} className="text-slate-700" />
                </button>
            </div>
        </div>
      </div>

      {/* Right Panel - Simulation Canvas */}
      <div className="flex-1 relative h-full overflow-hidden bg-slate-100">
        <SimulationCanvas config={activeConfig} />
        
        {/* Overlay Stats Chart */}
        <div className="absolute bottom-8 right-8 w-64 md:w-80 z-10">
            {activeConfig.mode !== 'intro' && (
                <StatsChart 
                    drift={activeConfig.drift} 
                    volatility={activeConfig.volatility}
                    leverage={activeConfig.leverage}
                />
            )}
        </div>

        {/* Legend Overlay */}
        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200 max-w-xs">
            <div className="text-xs font-bold text-slate-500 uppercase mb-2">Legend</div>
            <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>You (The Walker)</span>
                </div>
                {activeConfig.showCliff && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-400/50 border border-red-400"></div>
                        <span>The Cliff (Bankruptcy)</span>
                    </div>
                )}
                 {activeConfig.drift < 0 && (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-px bg-amber-500"></div>
                        <span>Negative Drift (Wind)</span>
                    </div>
                )}
                 {activeConfig.drift > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-px bg-emerald-500"></div>
                        <span>Positive Drift (Updraft)</span>
                    </div>
                )}
            </div>
        </div>
      </div>

    </div>
  );
};

export default App;