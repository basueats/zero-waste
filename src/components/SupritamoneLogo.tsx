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
      subtitle: 'text-[10px] tracking-[0.2em]',
      zeroWaste: 'text-[9px] tracking-[0.14em]',
      dot: 'w-2 h-2',
    },
    md: {
      title: 'text-[22px] sm:text-2xl',
      subtitle: 'text-[11px] tracking-[0.22em]',
      zeroWaste: 'text-[10px] tracking-[0.16em]',
      dot: 'w-2 h-2',
    },
    lg: {
      title: 'text-2xl sm:text-3xl',
      subtitle: 'text-xs tracking-[0.24em]',
      zeroWaste: 'text-[11px] tracking-[0.18em]',
      dot: 'w-2.5 h-2.5',
    },
  }[size];

  return (
    <div
      className={`inline-flex flex-col justify-center leading-none select-none text-left group antialiased ${
        isInverted ? 'bg-black/90 rounded-lg px-2.5 py-1.5' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`font-black tracking-tight font-heading leading-none ${typographySizes.title} ${
            isInverted
              ? 'text-white'
              : 'text-[#0b1220] group-hover:text-black transition-colors'
          }`}
        >
          Supritamone
        </span>
        <span
          className={`inline-block rounded-full bg-emerald-500 shrink-0 -mt-1 ${typographySizes.dot}`}
        />
      </div>

      {showSubtitle && (
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className={`font-extrabold uppercase font-sans leading-none ${typographySizes.subtitle} ${
              isInverted ? 'text-emerald-400' : 'text-[#059669]'
            }`}
          >
            ACADEMY
          </span>
          <span
            className={`text-[10px] font-bold leading-none ${
              isInverted ? 'text-slate-400' : 'text-neutral-400'
            }`}
          >
            ·
          </span>
          <span
            className={`font-bold uppercase font-sans leading-none ${typographySizes.zeroWaste} ${
              isInverted ? 'text-slate-200' : 'text-neutral-700'
            }`}
          >
            ZERO WASTE
          </span>
        </div>
      )}
    </div>
  );
};
