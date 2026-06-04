import type { HungryState } from '@/types';

export interface HungryStateMeta {
  label: string;
  color: string;
}

export const HUNGRY_STATE_META: Record<HungryState, HungryStateMeta> = {
  1: { label: 'شبعان',     color: '#34D399' }, // satisfied  — emerald
  2: { label: 'عادي',      color: '#06B6D4' }, // normal     — teal
  3: { label: 'جائع',      color: '#f59e0b' }, // hungry     — amber
  4: { label: 'جوع شديد', color: '#fb7185' }, // very hungry — rose
};

export const getHungryStateMeta = (state: number): HungryStateMeta | null =>
  HUNGRY_STATE_META[state as HungryState] ?? null;
