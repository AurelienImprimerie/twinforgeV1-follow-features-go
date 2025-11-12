import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import type { IconName } from '@/ui/icons/registry';

const FORGE_CARDS = [
  {
    icon: 'Dumbbell',
    label: 'Forge de Force',
    description: 'Commencez votre premier entraînement',
    color: '#18E3FF',
    link: '/training'
  },
  {
    icon: 'Utensils',
    label: 'Forge Nutritionnelle',
    description: 'Scannez votre premier repas',
    color: '#10B981',
    link: '/fridge'
  },
  {
    icon: 'User',
    label: 'Forge Corporelle',
    description: 'Créez votre avatar 3D',
    color: '#A855F7',
    link: '/body-scan'
  },
  {
    icon: 'Timer',
    label: 'Forge Temporelle',
    description: 'Démarrez un protocole de jeûne',
    color: '#F59E0B',
    link: '/fasting'
  },
  {
    icon: 'Activity',
    label: 'Forge Énergétique',
    description: 'Connectez votre wearable',
    color: '#3B82F6',
    link: '/settings/wearables'
  }
] as const;

export function DashboardEmptyState() {
  return (
    <div className="text-center py-12 px-6">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative inline-block">
          <div
            className="absolute inset-0 blur-3xl opacity-50"
            style={{
              background: 'radial-gradient(circle, #18E3FF 0%, #10B981 50%, #A855F7 100%)'
            }}
          />
          <SpatialIcon name="Sparkles" size={80} className="relative" color="#18E3FF" />
        </div>
      </motion.div>

      <motion.h2
        className="text-3xl font-bold mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Votre Transformation Commence Ici
      </motion.h2>

      <motion.p
        className="text-lg opacity-70 mb-12 max-w-2xl mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Utilisez les Forges TwinForge pour créer votre profil de transformation personnalisé.
        Chaque action vous rapproche de vos objectifs.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {FORGE_CARDS.map((forge, index) => (
          <motion.div
            key={forge.label}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Link to={forge.link}>
              <motion.div
                className="p-6 rounded-2xl text-left cursor-pointer group relative overflow-hidden"
                style={{
                  background: `color-mix(in srgb, ${forge.color} 8%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${forge.color} 25%, transparent)`
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${forge.color}20 0%, transparent 70%)`
                  }}
                />

                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 relative"
                  style={{
                    background: `color-mix(in srgb, ${forge.color} 20%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${forge.color} 40%, transparent)`
                  }}
                >
                  <SpatialIcon name={forge.icon as IconName} size={28} color={forge.color} />
                </div>

                <h3 className="text-lg font-bold mb-2 relative">{forge.label}</h3>
                <p className="text-sm opacity-70 relative">{forge.description}</p>

                <motion.div
                  className="mt-4 flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity relative"
                  style={{ color: forge.color }}
                >
                  <span className="text-sm font-medium">Commencer</span>
                  <SpatialIcon name="ArrowRight" size={16} />
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <SpatialIcon name="Info" size={16} className="opacity-70" />
          <span className="text-sm opacity-70">
            Votre score sera calculé dès que vous commencerez à utiliser les Forges
          </span>
        </div>
      </motion.div>
    </div>
  );
}
