import type { HealthCondition } from '@/types';

import type { IHealthConditionsRepository } from './IHealthConditionsRepository';

const CONDITIONS: HealthCondition[] = [
  { code: 'HC01', name: 'السكري 🩸', name_en: 'Diabetes', active: true, image: 'hc_diabetes' },
  { code: 'HC02', name: 'ضغط الدم 💓', name_en: 'Blood pressure', active: true, image: 'hc_blood_pressure' },
  { code: 'HC03', name: 'الكوليسترول 🫀', name_en: 'Cholesterol', active: true, image: 'hc_colesterol' },
  { code: 'HC04', name: 'القولون العصبي 🫁', name_en: 'Irritable bowel', active: true, image: 'hc_intestine' },
  { code: 'HC05', name: 'مشاكل المفاصل 🦴', name_en: 'Joint problems', active: true, image: 'hc_joint' },
  { code: 'HC06', name: 'الجيوب الانفية', name_en: 'Sinusitis', active: true, image: 'hc_sinus' },
  { code: 'HC07', name: 'السمنة', name_en: 'Obesity', active: true, image: 'hc_obesity' },
  { code: 'HC08', name: 'أخرى □', name_en: 'Other', active: true, image: 'hc_other' },
];

export class HealthConditionsRepositoryMock implements IHealthConditionsRepository {
  async listActiveConditions(): Promise<HealthCondition[]> {
    return CONDITIONS.filter((c) => c.active);
  }
}
