import React, { useEffect, useRef, useState } from 'react';
import { Image, View, type ImageResizeMode, type ImageSourcePropType } from 'react-native';

import { Skeleton } from '@/components/common/Skeleton';

interface MealImageProps {
  uri: string | null;
  defaultSource: ImageSourcePropType;
  className?: string;
  resizeMode?: ImageResizeMode;
}

// `onLoad`/`onError` are the only image events that fire reliably on both
// platforms — `onLoadStart` is inconsistent on Android, so it's not used at
// all. "Pending" is derived purely from "do we have a uri we haven't gotten
// a load/error result for yet", tracked in a ref so a late event from a uri
// we've since moved past can never resolve the wrong image.
//
// The skeleton itself only appears after a short delay: an image already in
// the native cache (very common — the same meal shown elsewhere in the app)
// resolves within a handful of milliseconds, and painting the skeleton for
// that single frame reads as a flicker rather than a loading state.
const SKELETON_REVEAL_DELAY_MS = 120;

/**
 * Renders a meal image from `uri`, falling back to `defaultSource` when the
 * uri is missing or fails to load at runtime (e.g. generated code+baseUrl
 * url doesn't exist in storage). Shows a pulsing skeleton over the image
 * while a remote `uri` is genuinely still loading, without flickering for
 * uris that resolve instantly from cache.
 */
export function MealImage({ uri, defaultSource, className, resizeMode = 'cover' }: MealImageProps) {
  const [failed, setFailed] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const pendingRef = useRef(false);

  useEffect(() => {
    setFailed(false);
    setShowSkeleton(false);
    pendingRef.current = !!uri;

    if (!uri) return;
    const timer = setTimeout(() => {
      if (pendingRef.current) setShowSkeleton(true);
    }, SKELETON_REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [uri]);

  const resolve = (outcome: 'loaded' | 'error') => {
    pendingRef.current = false;
    setShowSkeleton(false);
    if (outcome === 'error') setFailed(true);
  };

  const source = uri && !failed ? { uri } : defaultSource;

  return (
    <View className={className}>
      <Image
        source={source}
        className="h-full w-full"
        resizeMode={resizeMode}
        onLoad={() => resolve('loaded')}
        onError={() => resolve('error')}
      />
      {showSkeleton && <Skeleton className="absolute inset-0 h-full w-full" />}
    </View>
  );
}
