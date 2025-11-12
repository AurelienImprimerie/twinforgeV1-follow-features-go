# Gaming Empty State Template

Template standardisé pour créer des composants d'empty state gamifiés dans l'application.

## Structure de Base

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { useGamificationProgress } from '@/hooks/coeur/useGamification';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';

interface EmptyStateProps {
  onStartAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onStartAction }) => {
  const navigate = useNavigate();
  const { isPerformanceMode, performanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  const { data: gamification } = useGamificationProgress();

  const XP_REWARD = 50; // Personnaliser selon l'action

  const handleStartAction = () => {
    if (onStartAction) {
      onStartAction();
    } else {
      navigate('/your-action-route');
    }
  };

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: 'easeOut' }
      })}
      className="text-center py-12 py-1"
    >
      <GlassCard
        className="p-6 sm:p-8"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(R, G, B, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(R2, G2, B2, 0.12) 0%, transparent 50%),
            rgba(0, 0, 0, 0.4)
          `,
          borderColor: 'rgba(R, G, B, 0.4)',
          boxShadow: `
            0 0 40px rgba(R, G, B, 0.25),
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          backdropFilter: 'blur(20px) saturate(1.2)'
        }}
      >
        {/* Structure complète ci-dessous */}
      </GlassCard>
    </MotionDiv>
  );
};

export default EmptyState;
```

## Palettes de Couleurs par Forge

### Forge Énergétique (Activity)
- **Tracker**: Bleu `#3B82F6` / `#60A5FA` (rgb: 59, 130, 246 / 96, 165, 250)
- **Insights**: Orange `#F59E0B` / `#FB923C` (rgb: 245, 158, 11 / 251, 146, 60)
- **Progression**: Vert `#10B981` / `#34D399` (rgb: 16, 185, 129 / 52, 211, 153)
- **Historique**: Violet `#8B5CF6` / `#A78BFA` (rgb: 139, 92, 246 / 167, 139, 250)

### Forge Temporelle (Fasting)
- **Tracker**: Orange `#F59E0B` / `#FBBF24` (rgb: 245, 158, 11 / 251, 191, 36)
- **Insights**: Vert `#10B981` / `#34D399` (rgb: 16, 185, 129 / 52, 211, 153)
- **Progression**: Cyan `#06B6D4` / `#22D3EE` (rgb: 6, 182, 212 / 34, 211, 238)
- **Historique**: Violet `#8B5CF6` / `#A78BFA` (rgb: 139, 92, 246 / 167, 139, 250)

## Structure HTML Complète

```tsx
<div className="space-y-8 flex flex-col items-center">
  {/* 1. Gaming Hero Section */}
  <motion.div className="text-center space-y-4" {...fadeInUp}>
    {/* Icon avec glow animé */}
    <motion.div className="relative w-28 h-28 mx-auto flex items-center justify-center" {...pulseAnimation}>
      {performanceMode !== 'low' && (
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(R, G, B, 0.4), rgba(R2, G2, B2, 0.3))' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <div
        className="relative w-24 h-24 rounded-3xl flex items-center justify-center backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(R, G, B, 0.4), rgba(R2, G2, B2, 0.3))',
          border: '2px solid rgba(R, G, B, 0.5)',
          boxShadow: '0 0 40px rgba(R, G, B, 0.5)'
        }}
      >
        <SpatialIcon Icon={ICONS.YourIcon} size={56} color="#HEX_COLOR" glowColor="#HEX_COLOR2" variant="pure" />
      </div>
    </motion.div>

    {/* XP Reward Hero */}
    <motion.div {...slideInUp}>
      <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-color-400 via-color-500 to-color-400 mb-2">
        +{XP_REWARD} XP
      </h1>
      <p className="text-lg text-white/80 font-semibold">
        Message de récompense contextuel
      </p>
    </motion.div>

    {/* Message Motivationnel */}
    <motion.p className="text-base text-white/70 max-w-md mx-auto" {...fadeIn}>
      Message motivationnel expliquant l'action
    </motion.p>
  </motion.div>

  {/* 2. Gaming Progress Card */}
  {gamification && (
    <motion.div className="w-full" {...slideInLeft}>
      <div
        className="glass-card rounded-2xl p-5 border-2"
        style={{
          background: 'linear-gradient(135deg, rgba(R, G, B, 0.1), rgba(R2, G2, B2, 0.08))',
          borderColor: 'rgba(R, G, B, 0.3)',
          boxShadow: '0 8px 32px rgba(R, G, B, 0.15)'
        }}
      >
        {/* Header avec niveau */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Target} size={18} color="#HEX_COLOR" />
            Ta Progression Gaming
          </h3>
          <div className="px-3 py-1 rounded-full" style={{ background: 'rgba(R, G, B, 0.2)', border: '1px solid rgba(R, G, B, 0.4)' }}>
            <span className="text-sm font-black text-color-400">Niveau {gamification.currentLevel}</span>
          </div>
        </div>

        {/* Stats Grid: Total XP + Streak */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="text-center">
            <p className="text-2xl font-black text-white mb-1">{gamification.totalXpEarned.toLocaleString()}</p>
            <p className="text-xs text-white/60">Total XP</p>
          </div>
          {gamification.currentStreakDays > 0 && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <SpatialIcon Icon={ICONS.Flame} size={14} color="#EF4444" />
                <p className="text-2xl font-black text-white">{gamification.currentStreakDays}</p>
              </div>
              <p className="text-xs text-white/60">Streak actif</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )}

  {/* 3. Impact Cards */}
  <motion.div className="w-full" {...slideInUp}>
    <h3 className="text-lg font-bold text-white text-center mb-4">Débloqué avec cette action</h3>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card 1 */}
      <motion.div
        className="glass-card rounded-xl p-4 text-center border-2"
        style={{
          background: 'linear-gradient(135deg, rgba(R, G, B, 0.08), transparent)',
          borderColor: 'rgba(R, G, B, 0.3)'
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <SpatialIcon Icon={ICONS.Icon1} size={32} color="#HEX_COLOR" className="mx-auto mb-2" />
        <p className="text-lg font-black text-color-400 mb-1">Feature 1</p>
        <p className="text-xs text-white/70">description courte</p>
      </motion.div>

      {/* Répéter pour Card 2 et Card 3 */}
    </div>
  </motion.div>

  {/* 4. Gaming CTA Button */}
  <motion.div className="pt-4 w-full" {...scaleIn}>
    <button
      onClick={handleStartAction}
      className="group relative w-full px-10 py-5 text-white font-black rounded-2xl transform transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, #HEX_COLOR1 0%, #HEX_COLOR2 100%)',
        border: '2px solid rgba(R, G, B, 0.8)',
        boxShadow: '0 0 40px rgba(R, G, B, 0.5), 0 12px 32px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.25)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 0 60px rgba(R, G, B, 0.7), 0 16px 40px rgba(0, 0, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 0 40px rgba(R, G, B, 0.5), 0 12px 32px rgba(0, 0, 0, 0.4)';
      }}
    >
      {/* XP Badge sur le bouton */}
      <div
        className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #10B981, #34D399)',
          border: '2px solid rgba(16, 185, 129, 0.8)',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)'
        }}
      >
        <span className="text-sm font-black text-white">+{XP_REWARD} XP</span>
      </div>

      <div className="flex items-center justify-center gap-3">
        <SpatialIcon Icon={ICONS.YourIcon} size={28} style={{ filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))' }} />
        <span className="text-xl">Action CTA +{XP_REWARD} XP</span>
      </div>

      {/* Pulse Animation */}
      {performanceMode !== 'low' && (
        <motion.div
          className="absolute inset-0 rounded-2xl blur-xl -z-10"
          style={{ background: 'linear-gradient(135deg, #HEX_COLOR1, #HEX_COLOR2)' }}
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </button>
  </motion.div>

  {/* 5. Footer Tip */}
  <motion.div className="text-center" {...fadeIn}>
    <p className="text-sm text-white/60">Message final ou conseil</p>
  </motion.div>
</div>
```

## Récompenses XP par Action

### Forge Énergétique (Activity)
- **Tracker (Daily)**: 20 XP par activité loggée
- **Insights**: 15 XP par insight IA généré
- **Progression**: 20 XP par activité loggée
- **Historique**: 20 XP par activité dans l'historique

### Forge Temporelle (Fasting)
- **Tracker (Daily)**: 25-50 XP (selon durée du jeûne)
- **Insights**: 75 XP par analyse IA générée
- **Progression**: 60 XP par graphique de progression débloqué
- **Historique**: 50 XP par session dans l'historique

## Icônes Standards

- **Tracker**: `ICONS.Zap` (Activity), `ICONS.Timer` (Fasting)
- **Insights**: `ICONS.Lightbulb`, `ICONS.Brain`
- **Progression**: `ICONS.TrendingUp`, `ICONS.Activity`
- **Historique**: `ICONS.History`, `ICONS.BookOpen`

## Animations Standards

```typescript
// Fade In & Slide Up
const fadeInUp = !isPerformanceMode && {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.2 }
};

// Scale In
const scaleIn = !isPerformanceMode && {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, delay: 0.8, type: 'spring' }
};

// Pulse Animation (Icon)
const pulseAnimation = !isPerformanceMode && {
  animate: { scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] },
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
};
```

## Checklist de Création

- [ ] Choisir la palette de couleurs selon la forge et l'onglet
- [ ] Définir la récompense XP appropriée
- [ ] Sélectionner l'icône principale
- [ ] Créer 3 impact cards avec icônes et descriptions
- [ ] Rédiger le message motivationnel
- [ ] Définir l'action CTA et la route de navigation
- [ ] Tester les animations en mode performance normal et low
- [ ] Vérifier la responsiveness mobile
- [ ] S'assurer que le composant récupère `gamification` via `useGamificationProgress()`

## Notes Importantes

1. **Performance Mode**: Toujours utiliser `isPerformanceMode` pour conditionner les animations
2. **Motion Components**: Utiliser `MotionDiv = isPerformanceMode ? 'div' : motion.div`
3. **Glow Effects**: Désactiver en mode low performance avec `performanceMode !== 'low'`
4. **Gamification**: Afficher la card de progression uniquement si `gamification` existe
5. **Couleurs**: Toujours utiliser RGBA pour les backgrounds et borders pour la transparence
6. **Gradients**: Utiliser des gradients radiaux pour les backgrounds, linéaires pour les boutons
7. **Box Shadows**: Combiner glow, depth et inset pour l'effet glass morphism
8. **Hover States**: Implémenter via inline styles pour un contrôle précis
