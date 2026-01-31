import { motion } from 'framer-motion';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
  showPercentage?: boolean;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = 'hsl(var(--primary))',
  bgColor = 'hsl(var(--muted))',
  children,
  showPercentage = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <motion.span
            className="text-sm font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {Math.round(progress)}%
          </motion.span>
        ))}
      </div>
    </div>
  );
}

interface XPProgressRingProps {
  currentXP: number;
  xpToNextLevel: number;
  level: number;
  size?: number;
}

export function XPProgressRing({
  currentXP,
  xpToNextLevel,
  level,
  size = 100,
}: XPProgressRingProps) {
  const progress = Math.min((currentXP / xpToNextLevel) * 100, 100);
  
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <ProgressRing
        progress={progress}
        size={size}
        strokeWidth={10}
        color="hsl(var(--xp-primary))"
        bgColor="hsl(var(--muted))"
      />
      
      {/* Level Badge */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          key={level}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold text-amber-500"
        >
          {level}
        </motion.div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Level</span>
      </div>
      
      {/* XP Text */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-xs text-muted-foreground">
          {currentXP} / {xpToNextLevel} XP
        </span>
      </div>
    </div>
  );
}
