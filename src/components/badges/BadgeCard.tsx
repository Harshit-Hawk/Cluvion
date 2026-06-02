// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, Sparkles, X, Trophy, Zap } from 'lucide-react';
import { RARITY_CONFIG, CATEGORY_CONFIG } from '../../services/gamification/BadgeService';
import type { Badge, BadgeProgress, BadgeRarity } from '../../services/gamification/BadgeService';

// ─── Rarity Icon Map ────────────────────────────────────────
const RARITY_ICONS: Record<BadgeRarity, string> = {
  common: '⚪', uncommon: '🟢', rare: '🔵', epic: '🟣', legendary: '🌟',
};

// ─── Badge Card ─────────────────────────────────────────────
interface BadgeCardProps {
  progress: BadgeProgress;
  compact?: boolean;
  onSelect?: (badge: Badge) => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ progress, compact = false, onSelect }) => {
  const { badge, isUnlocked, progressPercent, currentValue } = progress;
  const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common;
  const category = CATEGORY_CONFIG[badge.category] || CATEGORY_CONFIG.special;

  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect?.(badge)}
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
          isUnlocked
            ? `bg-gradient-to-br ${rarity.bgGradient} ${rarity.darkBg} ${rarity.borderColor} ${rarity.darkBorder} shadow-lg ${rarity.glowColor}`
            : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-40'
        }`}
        title={badge.name}
      >
        {isUnlocked ? (
          <span className="text-2xl">{category.icon}</span>
        ) : (
          <Lock size={16} className="text-gray-400 dark:text-gray-600" />
        )}
        {isUnlocked && badge.rarity === 'legendary' && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
          </div>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(badge)}
      className={`relative w-full text-left rounded-2xl p-4 border-2 transition-all duration-300 overflow-hidden group ${
        isUnlocked
          ? `bg-gradient-to-br ${rarity.bgGradient} ${rarity.darkBg} ${rarity.borderColor} ${rarity.darkBorder} shadow-md hover:shadow-xl ${rarity.glowColor}`
          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50 opacity-60 hover:opacity-80'
      }`}
    >
      {/* Shimmer for epic/legendary */}
      {isUnlocked && (badge.rarity === 'epic' || badge.rarity === 'legendary') && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_3s_infinite] -translate-x-full" />
        </div>
      )}

      <div className="relative z-10 flex items-start gap-3">
        {/* Badge Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isUnlocked
            ? `bg-white/60 dark:bg-black/20 shadow-sm`
            : 'bg-gray-200 dark:bg-gray-700'
        }`}>
          {isUnlocked ? (
            <span className="text-2xl">{category.icon}</span>
          ) : (
            <Lock size={18} className="text-gray-400 dark:text-gray-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className={`text-sm font-bold truncate ${
              isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {badge.name}
            </h4>
            <span className="text-xs">{RARITY_ICONS[badge.rarity]}</span>
          </div>

          <p className={`text-[11px] leading-tight line-clamp-2 ${
            isUnlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
          }`}>
            {badge.description}
          </p>

          {/* Progress bar for locked badges */}
          {!isUnlocked && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                  {currentValue}/{badge.requirementValue}
                </span>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                  {progressPercent}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Rarity + XP tag for unlocked */}
          {isUnlocked && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${rarity.textColor}`}>
                {rarity.label}
              </span>
              {badge.xpReward > 0 && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                  +{badge.xpReward} XP
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
};

// ─── Badge Detail Modal ─────────────────────────────────────
interface BadgeModalProps {
  badge: Badge | null;
  isUnlocked: boolean;
  earnedAt?: string;
  onClose: () => void;
}

export const BadgeDetailModal: React.FC<BadgeModalProps> = ({ badge, isUnlocked, earnedAt, onClose }) => {
  if (!badge) return null;

  const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.common;
  const category = CATEGORY_CONFIG[badge.category] || CATEGORY_CONFIG.special;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-sm rounded-3xl p-8 shadow-2xl border-2 overflow-hidden ${
            isUnlocked
              ? `bg-gradient-to-br ${rarity.bgGradient} ${rarity.darkBg} ${rarity.borderColor} ${rarity.darkBorder}`
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
          }`}
        >
          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors">
            <X size={16} className="text-gray-700 dark:text-gray-300" />
          </button>

          {/* Shimmer for legendary */}
          {isUnlocked && badge.rarity === 'legendary' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2.5s_infinite] -translate-x-full" />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Large Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
              className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-5 shadow-lg ${
                isUnlocked
                  ? 'bg-white/70 dark:bg-black/20'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {isUnlocked ? (
                <span className="text-5xl">{category.icon}</span>
              ) : (
                <Lock size={36} className="text-gray-300 dark:text-gray-600" />
              )}
            </motion.div>

            {/* Badge Name */}
            <h2 className={`text-2xl font-black mb-1 ${
              isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {badge.name}
            </h2>

            {/* Rarity Pill */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
              isUnlocked
                ? `${rarity.textColor} bg-white/50 dark:bg-black/20`
                : 'text-gray-400 bg-gray-100 dark:bg-gray-800'
            }`}>
              {RARITY_ICONS[badge.rarity]} {rarity.label} • {category.label}
            </div>

            {/* Description */}
            <p className={`text-sm leading-relaxed mb-6 max-w-[280px] ${
              isUnlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
            }`}>
              {badge.description}
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4">
              {badge.xpReward > 0 && (
                <div className="flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400">
                  <Zap size={14} /> +{badge.xpReward} XP
                </div>
              )}
              {isUnlocked && earnedAt && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Earned {new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              )}
            </div>

            {!isUnlocked && (
              <div className="mt-4 text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
                Requirement: {badge.requirementValue} {badge.requirementType.replace(/_/g, ' ')}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeCard;
