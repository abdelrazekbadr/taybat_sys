import type { ImageSourcePropType } from 'react-native';

/**
 * Static asset icon map for OptionSelector.
 * Metro bundler requires require() calls to be string literals — dynamic paths are not allowed.
 * To add a new icon: drop the .png into assets/icons/ and add one entry here.
 */
export const ICON_SOURCES: Record<string, ImageSourcePropType> = {
  dish:            require('../assets/icons/dish.png'),
  level_active:    require('../assets/icons/level_active.png'),
  level_light:     require('../assets/icons/level_light.png'),
  level_moderate:  require('../assets/icons/level_moderate.png'),
  level_sedentary: require('../assets/icons/level_sedentary.png'),
  man:             require('../assets/icons/man.png'),
  woman:           require('../assets/icons/woman.png'),
  goal_pain:       require('../assets/icons/goal_pain.png'),
  goal_weight:     require('../assets/icons/goal_weight.png'),
  goal_sleep:      require('../assets/icons/goal_sleep.png'),
  goal_power:      require('../assets/icons/goal_power.png'),
  goal_digestive:  require('../assets/icons/goal_digestive.png'),
  goal_worry:      require('../assets/icons/goal_worry.png'),
  hc_diabetes:       require('../assets/icons/hc_diabetes.png'),
  hc_blood_pressure: require('../assets/icons/hc_blood_pressure.png'),
  hc_colesterol:     require('../assets/icons/hc_colesterol.png'),
  hc_intestine:      require('../assets/icons/hc_intestine.png'),
  hc_joint:          require('../assets/icons/hc_joint.png'),
  hc_sinus:          require('../assets/icons/hc_sinus.png'),
  hc_obesity:        require('../assets/icons/hc_obesity.png'),
  hc_other:          require('../assets/icons/hc_other.png'),

};
