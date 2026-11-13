import React, { useState } from 'react';

interface SupritamoneLogoProps {
  variant?: 'full' | 'inverted' | 'seal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
}

export const SupritamoneLogo: React.FC<SupritamoneLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const isInverted = variant === 'inverted';

  const imgHeights = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11',
  }[size];

  const typographySizes = {
    sm: {
      title: 'text-base sm:text-lg',
      subtitle: 'text-[9px] tracking-[0.22em]',
      dot: 'w-1.5 h-1.5',
    },
    md: {
      title: 'text-lg sm:text-xl',
      subtitle: 'text-[10px] tracking-[0.25em]',
      dot: 'w-1.5 h-1.5',
    },
    lg: {
      title: 'text-2xl sm:text-3xl',
      subtitle: 'text-xs tracking-[0.28em]',
      dot: 'w-2 h-2',
    },
  }[size];

  if (!imgError) {
    return (
      <div
        className={`inline-flex items-center select-none ${
          isInverted ? 'bg-white rounded-lg px-2 py-1 shadow-xs' : ''
        } ${className}`}
      >
        <img
          src="/assets/images/zero_waste_logo.png"
          alt="Supritamone Academy Zero Waste"
          onError={() => setImgError(true)}
          className={`w-auto object-contain ${imgHeights}`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col justify-center leading-none select-none text-left group ${className}`}>
      <div className="flex items-center gap-1">
        <span
          className={`font-extrabold tracking-tight font-['Outfit',sans-serif] ${typographySizes.title} ${
            isInverted
              ? 'text-white'
              : 'text-slate-950 group-hover:text-blue-600 transition-colors'
          }`}
        >
          Supritamone
        </span>
        <span className={`inline-block rounded-full bg-emerald-500 shrink-0 mb-0.5 ${typographySizes.dot}`} />
      </div>

      {showSubtitle && (
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`font-bold uppercase font-sans ${typographySizes.subtitle} ${
              isInverted ? 'text-emerald-400' : 'text-emerald-600'
            }`}
          >
            ACADEMY
          </span>
          <span className={`text-[8px] font-semibold opacity-40 ${isInverted ? 'text-slate-300' : 'text-slate-400'}`}>
            ·
          </span>
          <span
            className={`text-[8px] font-semibold uppercase tracking-wider opacity-60 hidden sm:inline ${
              isInverted ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Zero Waste
          </span>
        </div>
      )}
    </div>
  );
};
