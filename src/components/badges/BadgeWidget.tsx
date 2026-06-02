// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ChevronRight, Sparkles } from 'lucide-react';
import { BadgeService, RARITY_CONFIG, CATEGORY_CONFIG, BADGE_DEFINITIONS } from '../../services/gamification/BadgeService';
import type { UserBadge, BadgeRarity } from '../../services/gamification/BadgeService';

interface BadgeWidgetProps {
  userId: string;
  maxDisplay?: number;
}

const RARITY_ORDER: BadgeRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];

const BadgeWidget: React.FC<BadgeWidgetProps> = ({ userId, maxDisplay = 4 }) => {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await BadgeService.getUserBadges(userId);
        // Sort by rarity (highest first), then by most recent
        data.sort((a, b) => {
          const ri = RARITY_ORDER.indexOf(a.badge.rarity) - RARITY_ORDER.indexOf(b.badge.rarity);
          if (ri !== 0) return ri;
          return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
        });
        setBadges(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const totalBadges = BADGE_DEFINITIONS.length;
  const earnedCount = badges.length;
  const displayBadges = badges.slice(0, maxDisplay);
  const remaining = earnedCount - maxDisplay;

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-5 border border-gray-100/50 dark:border-gray-800/50 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-5 border border-gray-100/50 dark:border-gray-800/50 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-amber-500" />
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Badges
          </span>
        </div>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
          {earnedCount}/{totalBadges}
        </span>
      </div>

      {/* Badge row */}
      {earnedCount > 0 ? (
        <div className="flex items-center gap-2 flex-wrap">
          {displayBadges.map((ub, i) => {
            const rarity = RARITY_CONFIG[ub.badge.rarity] || RARITY_CONFIG.common;
            const cat = CATEGORY_CONFIG[ub.badge.category] || CATEGORY_CONFIG.special;

            return (
              <motion.div
                key={ub.id}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', damping: 15 }}
                title={`${ub.badge.name} (${rarity.label})`}
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center border-2 bg-gradient-to-br ${rarity.bgGradient} ${rarity.darkBg} ${rarity.borderColor} ${rarity.darkBorder} shadow-md hover:scale-110 transition-transform cursor-default`}
              >
                <span className="text-xl">{cat.icon}</span>
                {ub.badge.rarity === 'legendary' && (
                  <Sparkles size={8} className="absolute -top-1 -right-1 text-amber-400" />
                )}
              </motion.div>
            );
          })}
          {remaining > 0 && (
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
              +{remaining}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-3 text-sm font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          Start participating to earn badges!
        </div>
      )}

      {/* Rarity breakdown */}
      {earnedCount > 0 && (
        <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          {RARITY_ORDER.filter(r => badges.some(b => b.badge.rarity === r)).map(r => {
            const count = badges.filter(b => b.badge.rarity === r).length;
            const cfg = RARITY_CONFIG[r];
            return (
              <div key={r} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: cfg.color }} />
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default BadgeWidget;
