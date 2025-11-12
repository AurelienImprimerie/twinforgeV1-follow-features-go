export interface GuideStep {
  title: string;
  description: string;
  icon?: string;
}

export interface GuideFAQ {
  question: string;
  answer: string;
}

export interface GuideSection {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: keyof typeof import('../../ui/icons/registry').ICONS;
  keyPoints: string[];
  steps?: GuideStep[];
  tips?: string[];
  faq?: GuideFAQ[];
  relatedActions?: {
    label: string;
    description: string;
  }[];
}

export interface GuideContent {
  page: 'dashboard' | 'profile' | 'settings' | 'fasting' | 'activity' | 'nutrition' | 'fridge';
  title: string;
  description: string;
  sections: GuideSection[];
}

export type GuidePage = 'dashboard' | 'profile' | 'settings' | 'fasting' | 'activity' | 'nutrition' | 'fridge';
