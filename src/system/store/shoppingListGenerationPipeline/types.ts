/**
 * Shopping List Generation Pipeline Types
 */

export type ShoppingListGenerationStep = 'configuration' | 'generating' | 'validation';

export type LoadingState = 'idle' | 'generating' | 'streaming' | 'saving' | 'error';

export interface ShoppingListPipelineStep {
  id: ShoppingListGenerationStep;
  label: string;
  description: string;
}

export interface ShoppingListConfig {
  selectedMealPlanId: string | null;
  generationMode: 'user_only' | 'user_and_family';
}

export interface ShoppingListCandidate {
  id: string;
  name: string;
  generationMode: 'user_only' | 'user_and_family';
  totalItems: number;
  totalEstimatedCost: number;
  categories: ShoppingListCategory[];
  suggestions?: string[];
  advice?: string[];
  budgetEstimation?: BudgetEstimation;
  createdAt: string;
}

export interface ShoppingListCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  estimatedTotal: number;
  items: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  estimatedPrice: number;
  priority: 'low' | 'medium' | 'high';
  isChecked: boolean;
}

export interface BudgetEstimation {
  minTotal: number;
  maxTotal: number;
  averageTotal: number;
  byCategory: Record<string, { min: number; max: number; average: number }>;
  region: string;
  coefficient: number;
}
