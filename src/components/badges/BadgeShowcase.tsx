'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Filter, Sparkles } from 'lucide-react';
import BadgeCard, { BadgeDetailModal } from './BadgeCard';
import { BadgeService, BADGE_DEFINITIONS, RARITY_CONFIG, CATEGORY_CONFIG } from '../../services/gamification/BadgeService';
import type { Badge, BadgeProgress, BadgeRarity, BadgeCategory, UserBadge } from '../../services/gamification/BadgeService';

interface BadgeShowcaseProps {
  userId: string;
  stats: Record<string, any>;
  compact?: boolean;
}

const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ userId, stats, compact = false }) => {
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | BadgeRarity | BadgeCategory>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [progress, earned] = await Promise.all([
          BadgeService.getBadgeProgress(userId, stats),
          BadgeService.getUserBadges(userId),
        ]);
        setBadgeProgress(progress);
        setEarnedBadges(earned);
      } catch (err: any) {
        console.error('Failed to load badges:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, stats]);

  // Filter logic
  const filtered = badgeProgress.filter(bp => {
    if (activeFilter === 'all') return true;
    if (activeFilter in RARITY_CONFIG) return bp.badge.rarity === activeFilter;
    if (activeFilter in CATEGORY_CONFIG) return bp.badge.category === activeFilter;
    return true;
  });

  const unlockedCount = badgeProgress.filter(b => b.isUnlocked).length;
  const totalCount = BADGE_DEFINITIONS.length;
  const earnedMap = new Map(earnedBadges.map(ub => [ub.badgeId, ub]));

  // Compact mode: just show earned badges in a row
  if (compact) {
    const earned = badgeProgress.filter(b => b.isUnlocked);
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Badges ({unlockedCount}/{totalCount})
          </p>
          <Sparkles size={12} className="text-amber-400" />
        </div>
        {earned.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {earned.slice(0, 6).map(bp => (
              <BadgeCard key={bp.badge.id} progress={bp} compact onSelect={setSelectedBadge} />
            ))}
            {earned.length > 6 && (
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-500">
                +{earned.length - 6}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 py-4 rounded-xl text-center border border-dashed border-gray-200 dark:border-gray-700">
            No badges yet — start engaging!
          </div>
        )}

        {selectedBadge && (
          <BadgeDetailModal
            badge={selectedBadge}
            isUnlocked={!!earnedMap.get(selectedBadge.id)}
            earnedAt={earnedMap.get(selectedBadge.id)?.earnedAt}
            onClose={() => setSelectedBadge(null)}
          />
        )}
      </div>
    );
  }

  // Full showcase mode
  const rarityFilters: { key: 'all' | BadgeRarity; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: '🏆' },
    { key: 'common', label: 'Common', icon: '⚪' },
    { key: 'uncommon', label: 'Uncommon', icon: '🟢' },
    { key: 'rare', label: 'Rare', icon: '🔵' },
    { key: 'epic', label: 'Epic', icon: '🟣' },
    { key: 'legendary', label: 'Legendary', icon: '🌟' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shadow-sm">
            <Award size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Badge Collection</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
        </div>

        {/* Progress ring */}
        <div className="relative w-14 h-14">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3" className="stroke-gray-200 dark:stroke-gray-700" />
            <circle
              cx="24" cy="24" r="20" fill="none" strokeWidth="3"
              strokeDasharray={`${(unlockedCount / totalCount) * 125.6} 125.6`}
              strokeLinecap="round"
              className="stroke-amber-500 transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-gray-900 dark:text-white">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {rarityFilters.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeFilter === f.key
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>{f.icon}</span> {f.label}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Unlocked first, then locked sorted by progress */}
          {[...filtered]
            .sort((a, b) => {
              if (a.isUnlocked && !b.isUnlocked) return -1;
              if (!a.isUnlocked && b.isUnlocked) return 1;
              return b.progressPercent - a.progressPercent;
            })
            .map(bp => (
              <BadgeCard
                key={bp.badge.id}
                progress={bp}
                onSelect={setSelectedBadge}
              />
            ))}
        </div>
      )}

      {/* Badge Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          isUnlocked={!!earnedMap.get(selectedBadge.id)}
          earnedAt={earnedMap.get(selectedBadge.id)?.earnedAt}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </motion.div>
  );
};

export default BadgeShowcase;
