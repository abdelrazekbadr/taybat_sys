import { Dimensions, PixelRatio, Platform } from 'react-native';

/**
 * Normalizes a font size relative to a 390-point baseline (iPhone 15 / Pixel 7).
 *
 * How it works:
 *  1. Scale the size proportionally to the device's logical screen width so
 *     text fills the same visual proportion on every screen size.
 *  2. Divide by PixelRatio.getFontScale() to neutralize Android's "Font Size"
 *     accessibility setting — this is belt-and-suspenders on top of
 *     allowFontScaling={false}, covering edge cases where the OS-level scale
 *     still leaks through (e.g. Samsung One UI system apps, some RN versions).
 *  3. Round to the nearest pixel boundary to avoid sub-pixel blurring.
 */

const BASE_WIDTH = 390; // logical points — matches iPhone 15 / Pixel 7
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const platformScale = Platform.OS === 'android' ? 0.90 : 1;

export function nf(size: number): number {
  const scaled = size * widthScale;
  const fontScale = PixelRatio.getFontScale();
  return Math.round(PixelRatio.roundToNearestPixel((scaled / fontScale) * platformScale));
}

export function nlh(size: number): number {
  const scaled = size * widthScale;
  const fontScale = PixelRatio.getFontScale();
  return Math.round(PixelRatio.roundToNearestPixel((scaled / fontScale) * platformScale));
}
