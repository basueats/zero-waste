import React from 'react';

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
  const isInverted = variant === 'inverted';

  const typographySizes = {
    sm: {
      title: 'text-lg sm:text-xl',
      subtitle: 'text-[9.5px] tracking-[0.16em]',
    },
    md: {
      title: 'text-[21px] sm:text-2xl',
      subtitle: 'text-[10px] tracking-[0.18em]',
    },
    lg: {
      title: 'text-2xl sm:text-3xl',
      subtitle: 'text-[11px] tracking-[0.2em]',
    },
  }[size];

  return (
    <div
      className={`inline-flex flex-col justify-center leading-none select-none text-left group antialiased ${
        isInverted ? 'bg-black/90 rounded-lg px-2.5 py-1.5' : ''
      } ${className}`}
    >
      <div className="flex items-baseline">
        <span
          className={`font-black tracking-tight font-heading leading-none ${typographySizes.title} ${
            isInverted
              ? 'text-white'
              : 'text-[#0b1220] group-hover:text-black transition-colors'
          }`}
        >
          Zerowast
          <span className={isInverted ? 'text-emerald-400' : 'text-[#059669]'}>z</span>
        </span>
      </div>

      {showSubtitle && (
        <div className="flex items-center gap-1 mt-1">
          <span
            className={`font-extrabold uppercase font-sans leading-none ${typographySizes.subtitle} ${
              isInverted ? 'text-slate-300' : 'text-neutral-600'
            }`}
          >
            - BY <span className={isInverted ? 'text-emerald-400' : 'text-[#059669]'}>SUPRITAMONE</span>
          </span>
        </div>
      )}
    </div>
  );
};
