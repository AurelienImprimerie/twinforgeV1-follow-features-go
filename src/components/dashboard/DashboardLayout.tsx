/**
 * DashboardLayout V2.0 - Gaming-First Architecture
 * Nouveau système centré sur la gamification et la motivation
 */

import React from 'react';
import { motion } from 'framer-motion';
import GamingProgressWidgetV3 from './widgets/coeur/GamingProgressWidgetV3';
import GamingActionsWidget from './widgets/coeur/GamingActionsWidget';
import CalorieBalanceWidgetV3 from './widgets/CalorieBalanceWidgetV3';
import TrainingLiveWidget from './widgets/TrainingLiveWidget';
import NutritionActionsWidget from './widgets/NutritionActionsWidget';
import BodyScanWidget from './widgets/BodyScanWidget';

export function DashboardLayout() {
  return (
    <div className="space-y-6 w-full">
      {/* Gaming Progress Widget - Progression visible et motivante */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GamingProgressWidgetV3 />
      </motion.div>

      {/* Daily Actions - Routine Quotidienne uniquement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GamingActionsWidget showOnlyCategory="daily" />
      </motion.div>

      {/* Nutrition Actions - Section dédiée */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <NutritionActionsWidget />
      </motion.div>

      {/* Training Live - Section dédiée */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TrainingLiveWidget />
      </motion.div>

      {/* Body Scan 3D - Création du twin numérique */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <BodyScanWidget />
      </motion.div>

      {/* Calorie Balance V3 - Suivi énergétique quotidien gamifié */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <CalorieBalanceWidgetV3 />
      </motion.div>
    </div>
  );
}
