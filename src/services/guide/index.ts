export * from './types';
export { dashboardGuide } from './dashboardGuide';
export { profileGuide } from './profileGuide';
export { settingsGuide } from './settingsGuide';
export { fastingGuide } from './fastingGuide';
export { activityGuide } from './activityGuide';

import { dashboardGuide } from './dashboardGuide';
import { profileGuide } from './profileGuide';
import { settingsGuide } from './settingsGuide';
import { fastingGuide } from './fastingGuide';
import { activityGuide } from './activityGuide';
import type { GuideContent, GuidePage } from './types';

export const guides: Record<GuidePage, GuideContent> = {
  dashboard: dashboardGuide,
  profile: profileGuide,
  settings: settingsGuide,
  fasting: fastingGuide,
  activity: activityGuide
};

export function getGuideContent(page: GuidePage): GuideContent {
  return guides[page];
}

export function getGuideSection(page: GuidePage, sectionId: string) {
  const guide = guides[page];
  return guide.sections.find(section => section.id === sectionId);
}
