
import React, { useRef, useEffect, useState } from 'react';

interface Props {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  label?: string;
  step?: number;
}

const WheelPicker: React.FC<Props> = ({ min, max, value, onChange, label, step = 1 }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const itemHeight = 40; 
  const options = [];
  for (let i = min; i <= max; i += step) options.push(i);

  useEffect(() => {
    if (scrollRef.current) {
      const index = options.indexOf(value);
      if (index !== -1) {
        scrollRef.current.scrollTop = index * itemHeight;
        setScrollTop(index * itemHeight);
      }
    }
  }, [value]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const st = e.currentTarget.scrollTop;
    setScrollTop(st);
    const index = Math.round(st / itemHeight);
    const newVal = options[index];
    if (newVal !== undefined && newVal !== value) {
      onChange(newVal);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      {label && <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{label}</span>}
      <div className="relative w-20 h-[140px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner group perspective-1000">
        {/* Top/Bottom Fade Overlays */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-slate-950 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950 to-transparent z-20 pointer-events-none" />
        
        {/* Selection Highlight */}
        <div className="absolute inset-x-0 top-[50px] h-[40px] bg-indigo-500/10 border-y border-indigo-500/30 z-10 pointer-events-none" />
        
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll no-scrollbar snap-y snap-mandatory relative z-10"
          style={{ scrollPaddingBlock: '50px' }}
        >
          {/* Padding items */}
          <div style={{ height: '50px' }} />
          {options.map((opt, idx) => {
            const distance = Math.abs(idx * itemHeight - scrollTop);
            const opacity = Math.max(0.2, 1 - distance / 100);
            const scale = Math.max(0.8, 1.2 - distance / 150);
            const rotateX = (idx * itemHeight - scrollTop) / 4;

            return (
              <div 
                key={opt}
                className="h-[40px] flex items-center justify-center snap-center transition-all duration-75"
                style={{ 
                  opacity, 
                  transform: `scale(${scale}) rotateX(${rotateX}deg)`,
                  color: value === opt ? '#818cf8' : '#475569'
                }}
              >
                <span className="font-black text-lg tabular-nums">{opt}</span>
              </div>
            );
          })}
          <div style={{ height: '50px' }} />
        </div>
      </div>
    </div>
  );
};

export default WheelPicker;
