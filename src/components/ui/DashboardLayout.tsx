'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   DashboardContainer
   Full-width wrapper with consistent max-width + padding
───────────────────────────────────────────────────────── */
export function DashboardContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full max-w-7xl mx-auto px-0 ${className}`}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   DashboardGrid
   Adaptive grid: 1 col mobile, 2 col md, 4 col xl
───────────────────────────────────────────────────────── */
type GridCols = 2 | 3 | 4;
const colMap: Record<GridCols, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 xl:grid-cols-4',
};

export function DashboardGrid({
  children,
  cols = 4,
  gap = 4,
  className = '',
}: {
  children: React.ReactNode;
  cols?: GridCols;
  gap?: number;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 ${colMap[cols]} gap-${gap} ${className}`}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SectionHeader
   Consistent heading + optional action slot
───────────────────────────────────────────────────────── */
export function SectionHeader({
  title,
  subtitle,
  action,
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   StatCard
   Compact stat tile used in gamification header row
───────────────────────────────────────────────────────── */
export function StatCard({
  icon: Icon,
  label,
  value,
  accent = 'blue',
  loading = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  loading?: boolean;
}) {
  const colors: Record<string, string> = {
    blue:    'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    amber:   'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    purple:  'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    rose:    'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-2"
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors[accent]}`}>
        <Icon size={16} />
      </div>
      {loading ? (
        <div className="h-5 w-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      ) : (
        <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
      )}
      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-none">{label}</p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   EmptyState
   Replaces dead empty states with actionable prompts
───────────────────────────────────────────────────────── */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon size={22} className="text-gray-400 dark:text-gray-500" />
      </div>
      <p className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-1">{title}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          {action.label} →
        </button>
      )}
    </div>
  );
}
