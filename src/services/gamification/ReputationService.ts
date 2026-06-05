export interface ReputationTier {
  name: string;
  req: number;
}

export const REPUTATION_TIERS: ReputationTier[] = [
  { name: 'Novice', req: 0 },
  { name: 'Bronze', req: 100 },
  { name: 'Silver', req: 300 },
  { name: 'Gold', req: 600 },
  { name: 'Platinum', req: 1000 },
  { name: 'Diamond', req: 2000 },
  { name: 'Legend', req: 5000 }
];

export class ReputationService {
  /**
   * Calculates the reputation tier based on total XP
   */
  static calculateTier(xp: number): { tier: string; nextTierXp: number; progressPercent: number } {
    let currentTier: ReputationTier = { name: 'Novice', req: 0 };
    let nextTier: ReputationTier = { name: 'Bronze', req: 100 };

    for (let i = 0; i < REPUTATION_TIERS.length; i++) {
      const tier = REPUTATION_TIERS[i]!;
      if (xp >= tier.req) {
        currentTier = tier;
        nextTier = REPUTATION_TIERS[i + 1] || { name: 'Max Level', req: tier.req };
      } else {
        break;
      }
    }

    const tierRange = nextTier.req - currentTier.req;
    let progressPercent = 100;
    
    if (tierRange > 0) {
      const xpInTier = xp - currentTier.req;
      progressPercent = Math.min(100, Math.max(0, Math.round((xpInTier / tierRange) * 100)));
    }

    return { 
      tier: currentTier.name, 
      nextTierXp: nextTier.req,
      progressPercent
    };
  }
}
