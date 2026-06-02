import type { ImageSourcePropType } from 'react-native';

import type { Gender } from '@/types';

const AVATAR_SOURCES = {
  female: require('../assets/images/avatar/avatar_4.png'),
  male:   require('../assets/images/avatar/avatar_3.png'),
  guest:  require('../assets/images/avatar/avatar_1.png'),
} as const;

export function getDefaultAvatarSource(
  gender: Gender | null | undefined,
  isGuest = false,
): ImageSourcePropType {
  if (isGuest || gender == null) return AVATAR_SOURCES.guest;
  return AVATAR_SOURCES[gender];
}
