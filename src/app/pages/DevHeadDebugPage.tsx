import React, { useState, useEffect } from 'react';
import {
  Brain,
  Database,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  User,
  Utensils,
  ShoppingCart,
  ChefHat,
  Calendar,
  Dumbbell,
  Timer,
  Download,
  Eye,
  EyeOff,
  Zap,
  Package
} from 'lucide-react';
import GlassCard from '../../ui/cards/GlassCard';
import { brainCore } from '../../system/head/core/BrainCore';
import { supabase } from '../../system/supabase/client';
import logger from '../../lib/utils/logger';

interface HeadStatus {
  isInitialized: boolean;
  userId: string | null;
  health: any;
  metrics: any;
}

interface CollectorData {
  name: string;
  icon: any;
  color: string;
  data: any;
  error: string | null;
  loadTime: number;
  timestamp: string;
}

export default function DevHeadDebugPage() {
  const [headStatus, setHeadStatus] = useState<HeadStatus | null>(null);
  const [context, setContext] = useState<any>(null);
  const [collectors, setCollectors] = useState<CollectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['status']));
  const [rawSupabaseData, setRawSupabaseData] = useState<any>({});
  const [showRawData, setShowRawData] = useState(false);

  const loadHeadStatus = async () => {
    setLoading(true);
    try {
      logger.info('DEV_HEAD_DEBUG', 'Loading head system status');

      // Get head status
      const status: HeadStatus = {
        isInitialized: brainCore.isInitialized(),
        userId: brainCore.getCurrentUserId(),
        health: brainCore.getHealthStatus(),
        metrics: brainCore.getPerformanceMetrics(),
      };
      setHeadStatus(status);

      // Get full context if initialized
      if (status.isInitialized) {
        const ctx = await brainCore.getContext();
        setContext(ctx);

        // Load individual collector data
        await loadCollectorData(status.userId!);
      }

      logger.info('DEV_HEAD_DEBUG', 'Head status loaded', { status });
    } catch (error) {
      logger.error('DEV_HEAD_DEBUG', 'Failed to load head status', { error });
    } finally {
      setLoading(false);
    }
  };

  const loadCollectorData = async (userId: string) => {
    const startTime = Date.now();
    const collectorsData: CollectorData[] = [];

    // Profile
    try {
      const profileStart = Date.now();
      const { data: profile, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      collectorsData.push({
        name: 'Profile',
        icon: User,
        color: '#A855F7',
        data: profile,
        error: error?.message || null,
        loadTime: Date.now() - profileStart,
        timestamp: new Date().toISOString(),
      });

      setRawSupabaseData((prev: any) => ({ ...prev, profile }));
    } catch (error) {
      logger.error('DEV_HEAD_DEBUG', 'Failed to load profile', { error });
    }

    // Meals
    try {
      const mealsStart = Date.now();
      const { data: meals, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      collectorsData.push({
        name: 'Meals',
        icon: Utensils,
        color: '#10B981',
        data: meals,
        error: error?.message || null,
        loadTime: Date.now() - mealsStart,
        timestamp: new Date().toISOString(),
      });

      setRawSupabaseData((prev: any) => ({ ...prev, meals }));
    } catch (error) {
      logger.error('DEV_HEAD_DEBUG', 'Failed to load meals', { error });
    }

    // Meal Plans
    try {
      const planStart = Date.now();
      const { data: plans, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      collectorsData.push({
        name: 'Meal Plans',
        icon: Calendar,
        color: '#EC4899',
        data: plans,
        error: error?.message || null,
        loadTime: Date.now() - planStart,
        timestamp: new Date().toISOString(),
      });

      setRawSupabaseData((prev: any) => ({ ...prev, mealPlans: plans }));
    } catch (error) {
      logger.error('DEV_HEAD_DEBUG', 'Failed to load meal plans', { error });
    }

    // Shopping Lists
    try {
      const listStart = Date.now();
      const { data: lists, error: listsError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      let itemsCount = 0;
      if (lists && lists.length > 0) {
        const { count } = await supabase
          .from('shopping_list_items')
          .select('*', { count: 'exact', head: true })
          .in('shopping_list_id', lists.map(l => l.id));
        itemsCount = count || 0;
      }

      collectorsData.push({
        name: 'Shopping Lists',
        icon: ShoppingCart,
        color: '#3B82F6',
        data: { lists, totalItems: itemsCount },
        error: listsError?.message || null,
        loadTime: Date.now() - listStart,
        timestamp: new Date().toISOString(),
      });

      setRawSupabaseData((prev: any) => ({ ...prev, shoppingLists: lists }));
    } catch (error) {
      logger.error('DEV_HEAD_DEBUG', 'Failed to load shopping lists', { error });
    }

    // Fridge Scans
    try {
      const fridgeStart = Date.now();
      const { data: sessions, error } = await supabase
        .from('fridge_scan_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      collectorsData.push({
        name: 'Fridge Scans',
        icon: ChefHat,
        color: '#F59E0B',
        data: sessions,
        error: error?.message || null,
        loadTime: Date.now() - fridgeStart,
        timestamp: new Date().toISOString(),
      });

      setRawSupabaseData((prev: any) => ({ ...prev, fridgeScans: sessions }));
    } catch (error) {
      logger.error('DEV_HEAD_DEBUG', 'Failed to load fridge scans', { error });
    }

    // Training Sessions
    try {
      const trainingStart = Date.now();
      const { data: trainingSessions, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      collectorsData.push({
        name: 'Training Sessions',
        icon: Dumbbell,
        color: '#18E3FF',
        data: trainingSessions,
        error: error?.message || null,
        loadTime: Date.now() - trainingStart,
        timestamp: new Date().toISOString(),
      });

      setRawSupabaseData((prev: any) => ({ ...prev, trainingSessions }));
    } catch (error) {
      logger.error('DEV_HEAD_DEBUG', 'Failed to load training sessions', { error });
    }

    // Fasting Sessions
    try {
      const fastingStart = Date.now();
      const { data: fastingSessions, error } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      collectorsData.push({
        name: 'Fasting Sessions',
        icon: Timer,
        color: '#EF4444',
        data: fastingSessions,
        error: error?.message || null,
        loadTime: Date.now() - fastingStart,
        timestamp: new Date().toISOString(),
      });

      setRawSupabaseData((prev: any) => ({ ...prev, fastingSessions }));
    } catch (error) {
      logger.error('DEV_HEAD_DEBUG', 'Failed to load fasting sessions', { error });
    }

    setCollectors(collectorsData);
    logger.info('DEV_HEAD_DEBUG', 'All collectors loaded', {
      totalTime: Date.now() - startTime,
      collectorsCount: collectorsData.length,
    });
  };

  useEffect(() => {
    loadHeadStatus();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleRefresh = async () => {
    if (headStatus?.userId) {
      await brainCore.refresh();
    }
    await loadHeadStatus();
  };

  const handleInvalidateCache = (forgeType?: string) => {
    if (forgeType) {
      brainCore.invalidateCache(forgeType as any);
    } else {
      // Invalidate all
      ['training', 'equipment', 'nutrition', 'fasting', 'body-scan', 'energy', 'temporal'].forEach(
        (forge) => brainCore.invalidateCache(forge as any)
      );
    }
    loadHeadStatus();
  };

  const exportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      headStatus,
      context,
      collectors,
      rawSupabaseData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `head-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (hasError: boolean, hasData: boolean) => {
    if (hasError) return <XCircle className="w-5 h-5 text-red-400" />;
    if (hasData) return <CheckCircle className="w-5 h-5 text-green-400" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Head System Debug
          </h1>
          <p className="text-neutral-400">
            Diagnostic complet de synchronisation Brain ↔ Supabase
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-2"
          >
            {showRawData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showRawData ? 'Masquer' : 'Données Brutes'}
          </button>
          <button
            onClick={exportData}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Brain Status */}
      <GlassCard variant="premium">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('status')}
        >
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Brain Status
          </h2>
          {headStatus?.isInitialized ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : (
            <XCircle className="w-6 h-6 text-red-400" />
          )}
        </div>

        {expandedSections.has('status') && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-neutral-400 mb-1">Initialized</p>
                <p className="text-lg font-bold text-white">
                  {headStatus?.isInitialized ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-neutral-400 mb-1">User ID</p>
                <p className="text-lg font-bold text-white truncate">
                  {headStatus?.userId ? `${headStatus.userId.substring(0, 8)}...` : 'None'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-neutral-400 mb-1">Health</p>
                <p className="text-lg font-bold text-white">
                  {headStatus?.health?.brain || 'Unknown'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-neutral-400 mb-1">Cache</p>
                <p className="text-lg font-bold text-white">
                  {headStatus?.health?.cache || 'Unknown'}
                </p>
              </div>
            </div>

            {headStatus?.metrics && (
              <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                <h3 className="text-sm font-bold text-white mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-neutral-400">Total Latency:</span>
                    <span className="text-white ml-2">{headStatus.metrics.totalLatency}ms</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Cache Hit Rate:</span>
                    <span className="text-white ml-2">
                      {(headStatus.metrics.cacheHitRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Data Collection:</span>
                    <span className="text-white ml-2">
                      {headStatus.metrics.dataCollectionLatency}ms
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Data Collectors */}
      <GlassCard variant="premium">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('collectors')}
        >
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Data Collectors ({collectors.length})
          </h2>
          <Activity className="w-5 h-5 text-blue-400" />
        </div>

        {expandedSections.has('collectors') && (
          <div className="mt-4 space-y-3">
            {collectors.map((collector) => {
              const Icon = collector.icon;
              const hasError = !!collector.error;
              const dataArray = Array.isArray(collector.data) ? collector.data : [];
              const dataObject = !Array.isArray(collector.data) ? collector.data : null;
              const hasData = dataArray.length > 0 || (dataObject && Object.keys(dataObject).length > 0);

              return (
                <div
                  key={collector.name}
                  className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                  style={{ borderLeftColor: collector.color, borderLeftWidth: '3px' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" style={{ color: collector.color }} />
                      <div>
                        <h3 className="font-bold text-white">{collector.name}</h3>
                        <p className="text-xs text-neutral-400">
                          Loaded in {collector.loadTime}ms
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(hasError, hasData)}
                  </div>

                  {hasError && (
                    <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-2">
                      Error: {collector.error}
                    </div>
                  )}

                  {!hasError && (
                    <div className="space-y-2">
                      {Array.isArray(collector.data) && (
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-neutral-400">Records:</span>
                          <span className="font-bold text-white">{dataArray.length}</span>
                        </div>
                      )}

                      {dataObject && (
                        <div className="text-sm space-y-1">
                          {Object.entries(dataObject).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-neutral-400">{key}:</span>
                              <span className="text-white ml-2">
                                {typeof value === 'object' ? JSON.stringify(value).substring(0, 100) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {showRawData && collector.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-neutral-400 cursor-pointer hover:text-white">
                            Show Raw Data
                          </summary>
                          <pre className="mt-2 p-2 rounded bg-black/50 text-xs text-neutral-300 overflow-auto max-h-[300px]">
                            {JSON.stringify(collector.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Context Preview */}
      {context && (
        <GlassCard variant="premium">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('context')}
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Brain Context (Prompt Enrichment)
            </h2>
            <Package className="w-5 h-5 text-yellow-400" />
          </div>

          {expandedSections.has('context') && (
            <div className="mt-4 space-y-4">
              {/* Nutrition Summary */}
              {context.user?.nutrition && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Nutrition Context
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Recent Meals:</span>
                      <span className="text-white">{context.user.nutrition.recentMeals?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Meal Plans:</span>
                      <span className="text-white">{context.user.nutrition.mealPlans?.totalPlansGenerated || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Shopping Lists:</span>
                      <span className="text-white">{context.user.nutrition.shoppingLists?.totalListsGenerated || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Fridge Items:</span>
                      <span className="text-white">{context.user.nutrition.fridgeScans?.totalItemsInFridge || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw Context */}
              {showRawData && (
                <details>
                  <summary className="text-sm text-neutral-400 cursor-pointer hover:text-white mb-2">
                    Show Full Context Object
                  </summary>
                  <pre className="p-4 rounded-lg bg-black/50 text-xs text-neutral-300 overflow-auto max-h-[500px]">
                    {JSON.stringify(context, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </GlassCard>
      )}

      {/* Cache Control */}
      <GlassCard variant="premium">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-purple-400" />
          Cache Control
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleInvalidateCache()}
            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors"
          >
            Invalidate All Caches
          </button>
          {['training', 'nutrition', 'fasting', 'body-scan'].map((forge) => (
            <button
              key={forge}
              onClick={() => handleInvalidateCache(forge)}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              Clear {forge}
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
