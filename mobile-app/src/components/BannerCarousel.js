import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, ImageBackground, ScrollView, StyleSheet, Dimensions, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getAssetUrl } from '../utils/assets';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;
const BANNER_HEIGHT = 180;
const SLIDE_GAP = 12;
const SLIDE_STEP = BANNER_WIDTH + SLIDE_GAP;
const AUTO_PLAY_MS = 4500;
const PAUSE_AFTER_TOUCH_MS = 8000;

const FALLBACK_GRADIENTS = ['#2563eb', '#7c3aed', '#0891b2', '#dc2626'];

export function buildBannerSlides(items = []) {
  return items.flatMap((item) => {
    const seen = new Set();
    const imagePaths = [];

    [item.image, ...(item.images || [])].filter(Boolean).forEach((path) => {
      if (!seen.has(path)) {
        seen.add(path);
        imagePaths.push(path);
      }
    });

    if (!imagePaths.length) {
      return [{ ...item, slideId: item._id }];
    }

    return imagePaths.map((path, index) => ({
      ...item,
      image: path,
      slideId: `${item._id}-${index}`,
    }));
  });
}

export default function BannerCarousel({ items = [], autoPlay = true }) {
  const { colors } = useTheme();
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayEnabled = useRef(autoPlay);
  const pauseTimer = useRef(null);

  const slides = useMemo(() => buildBannerSlides(items), [items]);

  const goToSlide = useCallback((index, animated = true) => {
    scrollRef.current?.scrollTo({ x: index * SLIDE_STEP, animated });
    setActiveIndex(index);
  }, []);

  const pauseAutoPlay = useCallback(() => {
    autoPlayEnabled.current = false;
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => {
      autoPlayEnabled.current = autoPlay;
    }, PAUSE_AFTER_TOUCH_MS);
  }, [autoPlay]);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return undefined;

    const timer = setInterval(() => {
      if (!autoPlayEnabled.current) return;
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        scrollRef.current?.scrollTo({ x: next * SLIDE_STEP, animated: true });
        return next;
      });
    }, AUTO_PLAY_MS);

    return () => {
      clearInterval(timer);
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
    };
  }, [autoPlay, slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      goToSlide(0, false);
    }
  }, [activeIndex, slides.length, goToSlide]);

  if (!slides.length) {
    return (
      <View style={[styles.banner, styles.fallback, { backgroundColor: colors.primary }]}>
        <Ionicons name="football-outline" size={48} color="rgba(255,255,255,0.3)" />
        <Text style={styles.fallbackTitle}>District Sports</Text>
        <Text style={styles.fallbackSubtitle}>Season 2026 is live</Text>
      </View>
    );
  }

  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SLIDE_STEP);
    if (index !== activeIndex && index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={SLIDE_STEP}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={pauseAutoPlay}
        onTouchStart={pauseAutoPlay}
        contentContainerStyle={styles.scrollContent}
      >
        {slides.map((item, index) => {
          const imageUri = getAssetUrl(item.image);
          const bgColor = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];

          if (imageUri) {
            return (
              <Pressable key={item.slideId} style={styles.bannerWrap} onPress={pauseAutoPlay}>
                <ImageBackground source={{ uri: imageUri }} style={styles.banner} imageStyle={styles.bannerImage}>
                  <View style={styles.overlay} />
                  <View style={styles.bannerContent}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>NEWS</Text>
                    </View>
                    <Text style={styles.bannerTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.bannerDesc} numberOfLines={2}>{item.content}</Text>
                  </View>
                </ImageBackground>
              </Pressable>
            );
          }

          return (
            <Pressable key={item.slideId} style={styles.bannerWrap} onPress={pauseAutoPlay}>
              <View style={[styles.banner, styles.fallback, { backgroundColor: bgColor }]}>
                <Ionicons name="megaphone-outline" size={36} color="rgba(255,255,255,0.35)" />
                <Text style={styles.bannerTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.bannerDesc} numberOfLines={2}>{item.content}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {slides.length > 1 && (
        <View style={styles.dots}>
          {slides.map((item, i) => (
            <Pressable
              key={item.slideId}
              onPress={() => {
                pauseAutoPlay();
                goToSlide(i);
              }}
              hitSlop={8}
            >
              <View
                style={[
                  styles.dot,
                  i === activeIndex && styles.dotActive,
                  { backgroundColor: i === activeIndex ? colors.primary : colors.border },
                ]}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, gap: SLIDE_GAP },
  bannerWrap: { width: BANNER_WIDTH },
  banner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bannerImage: { borderRadius: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
  },
  bannerContent: { padding: 16, zIndex: 1 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  bannerDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },
  fallback: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  fallbackTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 8 },
  fallbackSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, opacity: 0.5 },
  dotActive: { opacity: 1, width: 20 },
});
