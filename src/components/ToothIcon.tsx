import type { CSSProperties } from 'react';

export type ToothVariant = 'healthy' | 'decayed';

export type ToothIconProps = {
  variant: ToothVariant;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  title?: string;
};

const TOOTH_PATH =
  'M30 14c-9 0-16 7-16 17 0 7 2 12 4 18 2 5 4 13 5 22 1 8 4 13 8 13 4 0 6-3 7-10 1-7 2-11 5-11 3 0 4 4 5 11 1 7 3 10 7 10 4 0 7-5 8-13 1-9 3-17 5-22 2-6 4-11 4-18 0-10-7-17-16-17-5 0-9 2-12 5-3-3-7-5-12-5z';

export const ToothIcon = ({
  variant,
  size = '100%',
  className,
  style,
  title,
}: ToothIconProps) => {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path
        d={TOOTH_PATH}
        fill="var(--ttt-tooth-fill)"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Subtle highlight on enamel */}
      <path
        d="M38 30c-2 4-3 9-3 13"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {variant === 'decayed' && (
        <>
          <ellipse
            cx="55"
            cy="46"
            rx="9"
            ry="7"
            fill="var(--ttt-cavity-color)"
            opacity="0.92"
          />
          <ellipse
            cx="40"
            cy="60"
            rx="3.5"
            ry="2.5"
            fill="var(--ttt-cavity-color)"
            opacity="0.7"
          />
        </>
      )}
    </svg>
  );
};

export default ToothIcon;
