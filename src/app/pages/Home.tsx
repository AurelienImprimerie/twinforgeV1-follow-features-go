// src/app/pages/Home.tsx
import React from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../../ui/page/PageHeader';
import { useWelcomeTokensToast } from '@/hooks';
import { DashboardTabsLayout } from '../../components/dashboard/DashboardTabsLayout';

const Home: React.FC = () => {
  useWelcomeTokensToast();

  return (
    <div className="space-y-6 w-full max-w-none">
      <PageHeader
        icon="Home"
        title="Cœur de la Forge"
        subtitle="Votre hub central de gamification et progression"
        circuit="home"
        iconColor="#F7931E"
      />

      {/* Dashboard avec système de gaming */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DashboardTabsLayout />
      </motion.div>
    </div>
  );
};

export default Home;
