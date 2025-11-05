import { useState, useMemo } from 'react';
import type { MealPlanData } from '../../../../../../system/store/mealPlanStore/types';

interface UsePlanFilteringProps {
  allPlans: MealPlanData[];
}

export const usePlanFiltering = ({ allPlans }: UsePlanFilteringProps) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [minDays, setMinDays] = useState<number | undefined>(undefined);
  const [maxDays, setMaxDays] = useState<number | undefined>(undefined);
  const [minCalories, setMinCalories] = useState<number | undefined>(undefined);
  const [maxCalories, setMaxCalories] = useState<number | undefined>(undefined);

  const filteredPlans = useMemo(() => {
    let filtered = [...allPlans];

    // Search filter
    if (searchFilter.trim()) {
      const lowerSearch = searchFilter.toLowerCase();
      filtered = filtered.filter(plan => {
        const weekText = `semaine ${plan.weekNumber}`.toLowerCase();
        return weekText.includes(lowerSearch);
      });
    }

    // Min days filter
    if (minDays !== undefined) {
      filtered = filtered.filter(plan => {
        const planDays = plan.days?.length || 0;
        return planDays >= minDays;
      });
    }

    // Max days filter
    if (maxDays !== undefined) {
      filtered = filtered.filter(plan => {
        const planDays = plan.days?.length || 0;
        return planDays <= maxDays;
      });
    }

    // Min calories filter
    if (minCalories !== undefined && minCalories > 0) {
      filtered = filtered.filter(plan => {
        const avgCalories = plan.nutritionalSummary?.avgCaloriesPerDay || 0;
        return avgCalories >= minCalories;
      });
    }

    // Max calories filter
    if (maxCalories !== undefined && maxCalories > 0) {
      filtered = filtered.filter(plan => {
        const avgCalories = plan.nutritionalSummary?.avgCaloriesPerDay || 0;
        return avgCalories <= maxCalories;
      });
    }

    return filtered;
  }, [allPlans, searchFilter, minDays, maxDays, minCalories, maxCalories]);

  return {
    searchFilter,
    setSearchFilter,
    minDays,
    setMinDays,
    maxDays,
    setMaxDays,
    minCalories,
    setMinCalories,
    maxCalories,
    setMaxCalories,
    filteredPlans
  };
};
