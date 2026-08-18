interface FolderIcon3DProps {
  color: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  xs: { width: 40, height: 33 },
  sm: { width: 56, height: 46 },
  md: { width: 80, height: 66 },
  lg: { width: 110, height: 90 },
};

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function FolderIcon3D({ color, size = 'md', className = '' }: FolderIcon3DProps) {
  const { width, height } = sizes[size];
  const uid = color.replace('#', '');
  const light = lighten(color, 50);
  const dark = darken(color, 35);
  const mid = color;
  const highlight = lighten(color, 70);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 80 66"
        fill="none"
        aria-hidden
        className="drop-shadow-md"
      >
        <defs>
          <linearGradient id={`fb-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={light} />
            <stop offset="100%" stopColor={mid} />
          </linearGradient>
          <linearGradient id={`ff-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={highlight} />
            <stop offset="40%" stopColor={light} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <linearGradient id={`ft-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={light} />
            <stop offset="100%" stopColor={mid} />
          </linearGradient>
        </defs>

        {/* Back panel */}
        <path
          d="M4 16C4 12.6863 6.68629 10 10 10H30L36 16H66C69.3137 16 72 18.6863 72 22V54C72 57.3137 69.3137 60 66 60H10C6.68629 60 4 57.3137 4 54V16Z"
          fill={`url(#fb-${uid})`}
        />

        {/* Tab */}
        <path
          d="M10 10H30L36 16H10V10Z"
          fill={dark}
          opacity="0.3"
        />

        {/* Front panel */}
        <path
          d="M4 24C4 20.6863 6.68629 18 10 18H66C69.3137 18 72 20.6863 72 24V54C72 57.3137 69.3137 60 66 60H10C6.68629 60 4 57.3137 4 54V24Z"
          fill={`url(#ff-${uid})`}
        />

        {/* Top highlight */}
        <path
          d="M4 24H72V28C72 28 64 26 38 26C12 26 4 28 4 28V24Z"
          fill="white"
          fillOpacity="0.2"
        />

        {/* Inner shadow line */}
        <path
          d="M4 28H72"
          stroke={dark}
          strokeOpacity="0.15"
          strokeWidth="0.5"
        />

        {/* Ground shadow */}
        <ellipse cx="38" cy="62" rx="30" ry="3" fill={dark} fillOpacity="0.12" />
      </svg>
    </div>
  );
}

export function EmptyFolderIcon3D({ className = '' }: { className?: string }) {
  return (
    <div className={`relative inline-flex ${className}`}>
      <FolderIcon3D color="#B07CFF" size="lg" />
      <div className="absolute -bottom-1 -left-2 flex h-9 w-9 items-center justify-center rounded-full gradient-accent shadow-elevated ring-4 ring-background">
        <span className="text-xl font-bold text-white leading-none">+</span>
      </div>
    </div>
  );
}
