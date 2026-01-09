/**
 * Onboarding Slides Configuration
 * Define your onboarding slides here with translation keys
 */

export interface OnboardingSlide {
  id: string;
  titleKey: string;
  subtitleKey: string;
  icon: 'scan' | 'identify' | 'discover';
}

/**
 * Default onboarding slides
 * Update translation keys to match your locales/{lang}/translation.json
 */
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'slide-1',
    titleKey: 'onboarding.slides.scan.title',
    subtitleKey: 'onboarding.slides.scan.subtitle',
    icon: 'scan',
  },
  {
    id: 'slide-2',
    titleKey: 'onboarding.slides.identify.title',
    subtitleKey: 'onboarding.slides.identify.subtitle',
    icon: 'identify',
  },
  {
    id: 'slide-3',
    titleKey: 'onboarding.slides.discover.title',
    subtitleKey: 'onboarding.slides.discover.subtitle',
    icon: 'discover',
  },
];

/**
 * Animation configuration for onboarding
 */
export const ANIMATION_CONFIG = {
  spring: {
    damping: 15,
    stiffness: 100,
  },
  entrance: {
    duration: 400,
  },
  stagger: 100, // Delay between staggered animations in ms
};
