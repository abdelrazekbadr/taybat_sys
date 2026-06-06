import { X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FullScreenImageModalProps {
  uri: string | null;
  onClose: () => void;
}

const { width: W, height: H } = Dimensions.get('window');
const DISMISS_THRESHOLD_Y = 90;
const DISMISS_VELOCITY    = 0.7;

export function FullScreenImageModal({ uri, onClose }: FullScreenImageModalProps) {
  const insets = useSafeAreaInsets();

  // Animated values for swipe-to-dismiss
  const translateY = useRef(new Animated.Value(0)).current;
  const bgOpacity  = useRef(new Animated.Value(1)).current;

  // Reset animation state each time the modal re-opens
  useEffect(() => {
    if (uri) {
      translateY.setValue(0);
      bgOpacity.setValue(1);
    }
  }, [uri, translateY, bgOpacity]);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: H,  duration: 220, useNativeDriver: true }),
      Animated.timing(bgOpacity,  { toValue: 0,  duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  }, [translateY, bgOpacity, onClose]);

  // PanResponder — intercepts downward swipes on the image area
  // ScrollView handles the zoom natively (iOS) and the pan responder handles dismiss.
  const panResponder = useMemo(() => PanResponder.create({
    // Only capture clearly downward movement (not pinch or horizontal scroll)
    onMoveShouldSetPanResponder: (_, g) =>
      g.dy > 12 && Math.abs(g.dy) > Math.abs(g.dx) * 1.5,

    onPanResponderMove: (_, g) => {
      if (g.dy <= 0) return;
      translateY.setValue(g.dy);
      bgOpacity.setValue(Math.max(0.2, 1 - g.dy / (H * 0.55)));
    },

    onPanResponderRelease: (_, g) => {
      if (g.dy > DISMISS_THRESHOLD_Y || g.vy > DISMISS_VELOCITY) {
        dismiss();
      } else {
        Animated.parallel([
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, overshootClamping: true }),
          Animated.spring(bgOpacity,  { toValue: 1, useNativeDriver: true }),
        ]).start();
      }
    },
  }), [translateY, bgOpacity, dismiss]);

  return (
    <Modal
      visible={!!uri}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar hidden />

      {/* Animated background — dims as user swipes down */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: bgOpacity }]} />

      {/* Image — animated translateY drives swipe-to-dismiss */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        {/* ScrollView gives free pinch-to-zoom on iOS (maximumZoomScale) */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          maximumZoomScale={4}
          minimumZoomScale={1}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          centerContent
          bouncesZoom
          // Prevent the ScrollView's own pan from swallowing our dismiss gesture
          scrollEnabled
        >
          {uri ? (
            <Animated.Image
              source={{ uri }}
              resizeMode="contain"
              style={{ width: W, height: H * 0.88 }}
            />
          ) : null}
        </ScrollView>
      </Animated.View>

      {/* ✕ close button */}
      <Pressable
        onPress={onClose}
        hitSlop={16}
        style={({ pressed }) => ({
          position: 'absolute',
          top: insets.top + 8,
          right: 16,
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: 'rgba(0,0,0,0.6)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <X size={20} color="#fff" strokeWidth={2.5} />
      </Pressable>

      {/* Bottom close hint — also tappable */}
      <Pressable
        onPress={onClose}
        style={{
          position: 'absolute',
          bottom: insets.bottom + 22,
          alignSelf: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 7,
        }}
      >
        <Text style={styles.hintText}>
          اسحب للأسفل · اضغط ✕ · أو اضغط هنا للإغلاق
        </Text>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: 'Cairo_400Regular',
  },
});
