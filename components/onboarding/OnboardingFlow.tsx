/**
 * OnboardingFlow Component
 * Multi-slide onboarding experience with horizontal paging
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingSlide from './OnboardingSlide';
import OnboardingIndicator from './OnboardingIndicator';
import OnboardingCTA, { SkipButton } from './OnboardingCTA';
import { ONBOARDING_SLIDES, OnboardingSlide as SlideType } from './slides';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<SlideType>
);

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useOnboarding();
  const flatListRef = useRef<FlatList<SlideType>>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollOffset = useSharedValue(0);

  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1;

  const updateActiveIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.x;
      const newIndex = Math.round(event.contentOffset.x / SCREEN_WIDTH);
      if (newIndex >= 0 && newIndex < ONBOARDING_SLIDES.length) {
        runOnJS(updateActiveIndex)(newIndex);
      }
    },
  });

  const handleComplete = useCallback(async () => {
    await completeOnboarding();
    onComplete();
  }, [completeOnboarding, onComplete]);

  const handleSkip = useCallback(async () => {
    await completeOnboarding();
    onComplete();
  }, [completeOnboarding, onComplete]);

  const handleContinue = useCallback(() => {
    if (isLastSlide) {
      handleComplete();
    } else {
      flatListRef.current?.scrollToOffset({
        offset: (activeIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    }
  }, [activeIndex, isLastSlide, handleComplete]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const renderSlide = useCallback(
    ({ item, index }: { item: SlideType; index: number }) => (
      <OnboardingSlide
        titleKey={item.titleKey}
        subtitleKey={item.subtitleKey}
        icon={item.icon}
        index={index}
        scrollOffset={scrollOffset}
        isActive={index === activeIndex}
      />
    ),
    [scrollOffset, activeIndex]
  );

  const keyExtractor = useCallback((item: SlideType) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        getItemLayout={getItemLayout}
      />

      {/* Skip button - top right corner */}
      <View style={[styles.skipContainer, { top: insets.top + 10 }]}>
        <SkipButton onPress={handleSkip} isVisible={!isLastSlide} />
      </View>

      {/* Bottom controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
        {/* Page indicator */}
        <View style={styles.indicatorContainer}>
          <OnboardingIndicator
            scrollOffset={scrollOffset}
            screenWidth={SCREEN_WIDTH}
          />
        </View>

        {/* CTA button */}
        <View style={styles.ctaContainer}>
          <OnboardingCTA onPress={handleContinue} isVisible={true} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  skipContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  indicatorContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ctaContainer: {
    alignItems: 'center',
  },
});
